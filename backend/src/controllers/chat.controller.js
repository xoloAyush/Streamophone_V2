import { generateStreamToken } from "../config/stream.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getConversations = async (req, res) => {
    try {

        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate(
            "participants",
            "fullName profilePic nativeLanguage learningLanguage"
        )
        .populate({
            path: "lastMessage",
            populate: {
                path: "sender",
                select: "fullName profilePic"
            }
        })
        .sort({
            updatedAt: -1
        });

        res.status(200).json(conversations);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// export const getMessages = async (req, res) => {

//     try {

//         const { id: conversationId } = req.params;

//         const conversation = await Conversation.findOne({
//     _id: conversationId,
//     participants: req.user._id,
// });

// if (!conversation) {
//     return res.status(404).json({
//         message: "Conversation not found",
//     });
// }

//         const messages = await Message.find({
//             conversation: conversationId
//         })
//         .populate(
//             "sender",
//             "fullName profilePic"
//         )
//         .sort({
//             createdAt: 1
//         });

//         res.status(200).json(messages);

//     } catch (error) {

//         console.log(error);

//         res.status(500).json({
//             message: "Internal Server Error"
//         });

//     }

// };

export const getChat = async (req, res) => {
  try {

    const userId = req.user._id;
    const { friendId } = req.params;

    // Check friendship
    const user = await User.findOne({
      _id: userId,
      friends: friendId,
    });

    if (!user) {
      return res.status(403).json({
        message: "User is not your friend",
      });
    }

    // Find conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, friendId],
      },
    });

    // Create if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, friendId],
      });
    }

    // Get messages
    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate("sender", "fullName profilePic")
      .sort({
        createdAt: 1,
      });

    // Friend details
    const friend = await User.findById(friendId).select(
      "fullName profilePic nativeLanguage learningLanguage location"
    );

    return res.json({
      friend,
      conversation,
      messages,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });

  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    // Validate input
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required",
      });
    }

    // Check if receiver is in sender's friends list
    const sender = await User.findOne({
      _id: senderId,
      friends: receiverId,
    });

    if (!sender) {
      return res.status(403).json({
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

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text: text.trim(),
    });

    // Update last message
    conversation.lastMessage = message._id;
    await conversation.save();

    return res.status(201).json({
      success: true,
      conversation,
      message,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};