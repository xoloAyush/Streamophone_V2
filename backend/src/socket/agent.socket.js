// socket/agent.socket.js

import { Agent } from "../models/agent.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

import { generate } from "../services/ai.service.js";

import {
    buildConversationMessages,
} from "../prompts/agent.prompts.js";


export const registerAgentEvents = (io, socket) => {

    socket.on("send-agent-message", async (data) => {

        try {

            if (typeof data === "string") {
                data = JSON.parse(data);
            }

            const {
                agentId,
                conversationId,
                message,
            } = data;

            const userId = socket.user._id;

            // -----------------------------
            // 1. Validate message
            // -----------------------------

            if (!agentId || !message?.trim()) {

                return socket.emit("agent-message-error", {
                    message: "Agent ID and message are required",
                });

            }


            // -----------------------------
            // 2. Find agent
            // -----------------------------

            const agent = await Agent.findOne({
                _id: agentId,
                createdBy: userId,
            });

            if (!agent) {

                return socket.emit("agent-message-error", {
                    message: "Agent not found",
                });

            }


            // -----------------------------
            // 3. Find/Create conversation
            // -----------------------------

            let conversation;

            if (conversationId) {

                conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                    agent: agentId,
                });

                if (!conversation) {

                    return socket.emit("agent-message-error", {
                        message: "Conversation not found",
                    });

                }

            } else {

                conversation = await Conversation.findOne({
                    participants: userId,
                    agent: agentId,
                });

                if (!conversation) {

                    conversation = await Conversation.create({
                        participants: [userId],
                        agent: agentId,
                    });

                }

            }


            // -----------------------------
            // 4. Load conversation history
            // -----------------------------

            const history = await Message.find({
                conversation: conversation._id,
            })
                .sort({ createdAt: 1 })
                .limit(20);


            // -----------------------------
            // 5. Save user message
            // -----------------------------

            const userMessage = await Message.create({
                conversation: conversation._id,
                sender: userId,
                role: "user",
                text: message.trim(),
                type: "text",
            });


            // -----------------------------
            // 6. Send user message immediately
            // -----------------------------

            // 6. Send user message immediately

            socket.emit("agent-user-message", {
                conversationId: conversation._id,
                message: userMessage,
            });


            // -----------------------------
            // 7. Tell frontend AI is typing
            // -----------------------------

            socket.emit("agent-typing", {
                agentId,
                conversationId: conversation._id,
            });


            // -----------------------------
            // 8. Build AI messages
            // -----------------------------

            const messages = buildConversationMessages(
                agent,
                history,
                message.trim()
            );


            // -----------------------------
            // 9. Generate AI response
            // -----------------------------

            const result = await generate(messages);


            // -----------------------------
            // 10. Save AI message
            // -----------------------------

            const assistantMessage = await Message.create({
                conversation: conversation._id,
                sender: null,
                role: "assistant",
                text: result,
                type: "text",
            });


            // -----------------------------
            // 11. Update conversation
            // -----------------------------

            conversation.lastMessage = assistantMessage._id;

            await conversation.save();


            // -----------------------------
            // 12. Stop typing
            // -----------------------------

            socket.emit("agent-stop-typing", {
                agentId,
                conversationId: conversation._id,
            });


            // -----------------------------
            // 13. Send AI response
            // -----------------------------

            socket.emit("agent-message", {
                conversationId: conversation._id,
                message: assistantMessage,
            });


        } catch (error) {

            console.error(
                "Agent socket error:",
                error
            );

            socket.emit("agent-stop-typing");

            socket.emit("agent-message-error", {
                message: "Failed to generate agent response",
            });

        }

    });

};