import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        objective: {
            type: String,
            required: true,
            trim: true,
        },

        language: {
            type: String,
            default: "English",
        },

        tone: {
            type: String,
            default: "friendly",
        },

        behavior: {
            type: [String],
            default: [],
        },

        instructions: {
            type: String,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Agent = mongoose.model("Agent", agentSchema);