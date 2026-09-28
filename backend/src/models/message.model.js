import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            default: "user",
        },

        text: {
            type: String,
            trim: true,
            default: "",
        },

        attachments: [
            {
                url: String,
                manifestId: String,
                fileName: String,
                mimeType: String,
                size: Number,
            },
        ],

        type: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "file",
                "audio",
            ],
            default: "text",
        },

        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// console.log("Message model loaded");
// console.log(Object.keys(messageSchema.paths));

export default mongoose.model("Message", messageSchema);