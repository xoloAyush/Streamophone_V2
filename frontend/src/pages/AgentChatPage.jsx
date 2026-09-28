import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import {
    getAgentConversation,
} from "../lib/api";

import useSocket from "../hooks/useSocket";
import { socket } from "../lib/socket";

import AgentMessageList from "../components/chat/AgentMessageList";
import AgentMessageInput from "../components/AgentMessageInput";


const AgentChatPage = () => {

    const { agentId } = useParams();

    const [agent, setAgent] = useState(null);
    const [messages, setMessages] = useState([]);

    const [conversationId, setConversationId] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);


    // --------------------------------
    // Load previous conversation
    // --------------------------------

    useEffect(() => {

        const loadConversation = async () => {

            try {

                setIsLoading(true);

                const data = await getAgentConversation(agentId);

                console.log(
                    "Agent conversation:",
                    data
                );

                setAgent(data.agent);

                setConversationId(
                    data.conversationId
                );

                setMessages(
                    data.messages || []
                );

            } catch (error) {

                console.error(
                    "Failed to load agent conversation:",
                    error
                );

            } finally {

                setIsLoading(false);

            }

        };

        loadConversation();

    }, [agentId]);


    // --------------------------------
    // Agent user message
    // --------------------------------

    const handleAgentUserMessage = (data) => {

        console.log(
            "🔥 USER MESSAGE EVENT:",
            data
        );

        setConversationId(
            data.conversationId
        );

        setMessages((prev) => {

            console.log(
                "Previous messages:",
                prev
            );

            console.log(
                "Message being added:",
                data.message
            );

            return [
                ...prev,
                data.message,
            ];

        });

    };


    // --------------------------------
    // Agent AI response
    // --------------------------------

    const handleAgentMessage = (data) => {

        console.log(
            "🔥 AI MESSAGE EVENT:",
            data
        );

        console.log(
            "AI message:",
            data.message
        );

        setConversationId(
            data.conversationId
        );

        setMessages((prev) => {

            console.log(
                "Previous messages:",
                prev
            );

            console.log(
                "AI message being added:",
                data.message
            );

            return [
                ...prev,
                data.message,
            ];

        });

        setIsTyping(false);

    };


    // --------------------------------
    // AI typing
    // --------------------------------

    const handleAgentTyping = (data) => {

        console.log(
            "Agent typing:",
            data
        );

        if (data.agentId === agentId) {

            setIsTyping(true);

        }

    };


    // --------------------------------
    // AI stopped typing
    // --------------------------------

    const handleAgentStopTyping = (data) => {

        console.log(
            "Agent stopped typing:",
            data
        );

        setIsTyping(false);

    };


    // --------------------------------
    // Agent error
    // --------------------------------

    const handleAgentError = (error) => {

        console.error(
            "Agent error:",
            error
        );

        setIsTyping(false);

    };


    // --------------------------------
    // Socket events
    // --------------------------------

    const socketEvents = useMemo(() => ({

        "agent-user-message":
            handleAgentUserMessage,

        "agent-message":
            handleAgentMessage,

        "agent-typing":
            handleAgentTyping,

        "agent-stop-typing":
            handleAgentStopTyping,

        "agent-message-error":
            handleAgentError,

    }), [agentId]);


    useSocket(socketEvents);


    // --------------------------------
    // Send message
    // --------------------------------

    const handleSend = (text) => {

        if (!text?.trim()) return;


        if (!socket.connected) {

            console.error(
                "Socket not connected"
            );

            return;

        }


        console.log(
            "Sending agent message:",
            text
        );


        socket.emit(
            "send-agent-message",
            {
                agentId,
                conversationId,
                message: text.trim(),
            }
        );

    };


    // --------------------------------
    // Loading
    // --------------------------------

    if (isLoading) {

        return (
            <div className="flex h-full items-center justify-center">

                <span className="loading loading-spinner loading-lg" />

            </div>
        );

    }


    // --------------------------------
    // UI
    // --------------------------------

    return (
        <div className="flex flex-col h-full">

            {/* Header */}

            <div className="border-b border-base-300 p-4">

                <div className="flex items-center gap-3">

                    <div
                        className="
                            w-10
                            h-10
                            rounded-full
                            bg-primary
                            text-primary-content
                            flex
                            items-center
                            justify-center
                            font-bold
                        "
                    >
                        AI
                    </div>

                    <div>

                        <h2 className="font-bold">
                            {agent?.name}
                        </h2>

                        <p className="text-xs opacity-60">
                            {agent?.language} • {agent?.tone}
                        </p>

                    </div>

                </div>

            </div>


            {/* Messages */}

            <AgentMessageList
                messages={messages}
                isTyping={isTyping}
            />


            {/* Input */}

            <AgentMessageInput
                onSend={handleSend}
            />

        </div>
    );

};


export default AgentChatPage;