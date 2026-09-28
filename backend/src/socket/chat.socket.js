import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getUserSockets } from "./socketStore.js"; // adjust path if needed
// import User from "../models/user.model.js";
console.log(Message.schema.obj);

console.log("Schema paths:", Object.keys(Message.schema.paths));
console.log("Attachments path:", Message.schema.path("attachments"));

export const registerChatEvents = (io, socket) => {

    socket.on("send-message", async (data) => {

        try {


            // const senderId = socket.user._id;
            // console.log(senderId)

            // Handle Postman text payload
            if (typeof data === "string") {
                data = JSON.parse(data);
            }

            const {
    receiverId,
    type = "text",
    text = "",
    attachments = []
} = data;

console.log("Received data:", data);
console.log("Attachments:", attachments);

            const senderId = socket.user._id.toString();
const receiverIdStr = receiverId.toString();

// VALIDATION
const hasText = text.trim().length > 0;
const hasAttachment = attachments.length > 0;

if (!receiverIdStr || (!hasText && !hasAttachment)) {
    return socket.emit("message-error", {
        message: "Message cannot be empty"
    });
}

    const isFriend = socket.user.friends.some(
    (id) => id.toString() === receiverIdStr
);

if (!isFriend) {
    return socket.emit("message-error", {
        message: "You can only message your friends.",
    });
}


if (!senderId) {
    return socket.emit("message-error", {
        message: "You can only message your friends.",
    });
}
            // Find existing conversation
            let conversation = await Conversation.findOne({
                participants: {
                    $all: [senderId, receiverId],
                },
            });

            // Create conversation if it doesn't exist
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, receiverId],
                });
            }

            console.log("Saving:", {
  text,
  type,
  attachments,
});
            // Create message
            const message = await Message.create({
                conversation: conversation._id,
                sender: senderId,
                text: text.trim(),
                type,
                attachments
            });

            console.log("Saved message:", message.toObject());

            // Update last message
            conversation.lastMessage = message._id;
            await conversation.save();

            // Populate sender for frontend
            await message.populate(
                "sender",
                "fullName profilePic nativeLanguage learningLanguage"
            );

            // Send to receiver if online
            const receiverSockets = getUserSockets(receiverId);

            // console.log(receiverSockets)

            const senderSockets = getUserSockets(senderId);

            // senderSockets.forEach((socketId) => {
            //     io.to(socketId).emit("receive-message", message);
            // });

            // receiverSockets.forEach((socketId) => {
            //     io.to(socketId).emit("receive-message", message)
            // });

            const sockets = [
                ...new Set([...senderSockets, ...receiverSockets]),
            ];
            console.log("Sender sockets:", senderSockets);
console.log("Receiver sockets:", receiverSockets);
console.log("Emitting to:", sockets);
console.log("Message:", message);

// socket.emit() is synchronous—it does not return a Promise.
await Promise.all(
    sockets.map(socketId =>
        io.to(socketId).emit("receive-message", message)
    )
);

            // Acknowledge sender
            // socket.emit("message-sent", message);

        } catch (error) {
            console.log(error);

            socket.emit("message-error", {
                message: "Failed to send message"
            });
        }

    });

};