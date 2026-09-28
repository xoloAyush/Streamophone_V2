import { Agent } from "../models/agent.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

import { generate } from "../services/ai.service.js";

import {
    buildAgentPrompt,
    buildConversationMessages,
} from "../prompts/agent.prompts.js";

export async function createAgent(req, res) {
    try {
        const {
            name,
            objective,
            language,
            tone,
            behavior,
            instructions,
        } = req.body;

        if (!name || !objective) {
            return res.status(400).json({
                success: false,
                message: "Name and objective are required",
            });
        }

        const agent = await Agent.create({
            name,
            objective,
            language,
            tone,
            behavior,
            instructions,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            agent,
        });
    } catch (error) {
        console.error("Create agent error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create agent",
        });
    }
}

export async function getAgent(req, res) {
    try {
        const agent = await Agent.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        return res.json({
            success: true,
            agent,
        });
    } catch (error) {
        console.error("Get agent error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch agent",
        });
    }
}

export async function chatWithAgent(req, res) {
    try {
        const {
            message,
            conversationId,
        } = req.body;

        const { id: agentId } = req.params;

        const userId = req.user._id;

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // 1. Find the Agent
        const agent = await Agent.findOne({
            _id: agentId,
            createdBy: userId,
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        // 2. Find or create conversation
        let conversation;

        if (conversationId) {
            conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId,
                agent: agentId,
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found",
                });
            }
        } else {
            conversation = await Conversation.create({
                participants: [userId],
                agent: agentId,
            });
        }

        // 3. Load previous conversation history
        const history = await Message.find({
            conversation: conversation._id,
        })
            .sort({ createdAt: 1 })
            .limit(20);

        // 4. Build LLM messages
        const messages = buildConversationMessages(
            agent,
            history,
            message.trim()
        );

        // 5. Save user's message
        const userMessage = await Message.create({
            conversation: conversation._id,
            sender: userId,
            role: "user",
            text: message.trim(),
            type: "text",
        });

        // 6. Generate AI response
        const result = await generate(messages);

        // 7. Save AI message
        const assistantMessage = await Message.create({
            conversation: conversation._id,
            sender: null,
            role: "assistant",
            text: result,
            type: "text",
        });

        // 8. Update last message
        conversation.lastMessage = assistantMessage._id;
        await conversation.save();

        return res.status(200).json({
            success: true,

            conversationId: conversation._id,

            userMessage,

            assistantMessage,

            agent: {
                _id: agent._id,
                name: agent.name,
            },
        });

    } catch (error) {
        console.error("Agent chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate agent response",
        });
    }
}

export async function getAgentConversation(req, res) {
    try {
        const { id: agentId } = req.params;
        const userId = req.user._id;

        // Check agent
        const agent = await Agent.findOne({
            _id: agentId,
            createdBy: userId,
        }).select("name language tone");

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        // Find existing conversation
        const conversation = await Conversation.findOne({
            participants: userId,
            agent: agentId,
        }).sort({
            updatedAt: -1,
        });

        // No previous conversation
        if (!conversation) {
            return res.status(200).json({
                success: true,
                conversationId: null,
                messages: [],
                agent,
            });
        }

        // Load messages
        const messages = await Message.find({
            conversation: conversation._id,
        }).sort({
            createdAt: 1,
        });

        return res.status(200).json({
            success: true,
            conversationId: conversation._id,
            messages,
            agent,
        });

    } catch (error) {
        console.error(
            "Get agent conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load conversation",
        });
    }
}

export async function getAgents(req, res) {
  try {
    const agents = await Agent.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error("Get agents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
    });
  }
}


export async function deleteAgent(req, res) {
  try {
    const { agentId } = req.params;

    const agent = await Agent.findOneAndDelete({
      _id: agentId,
      createdBy: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agent deleted successfully",
    });

  } catch (error) {
    console.error("Delete agent error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete agent",
    });
  }
}