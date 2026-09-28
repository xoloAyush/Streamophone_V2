import { useEffect, useRef } from "react";

const AgentMessageList = ({ messages = [], isTyping = false }) => {
  const bottomRef = useRef(null);

  console.log("MESSAGES:", messages);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">

      {messages.map((message, index) => {

        if (!message) {
          console.log("❌ Undefined message at index:", index);
          return null;
        }

        const isUser = message.role === "user";

        return (
          <div
            key={message._id || index}
            className={`chat ${isUser ? "chat-end" : "chat-start"
              }`}
          >

            {/* Avatar */}
            <div className="chat-image avatar placeholder">
              <div
                className={`w-9 rounded-full flex items-center justify-center ${isUser
                  ? "bg-primary text-primary-content"
                  : "bg-secondary text-secondary-content"
                  }`}
              >
                <span className="text-xs font-bold">
                  {isUser ? "You" : "AI"}
                </span>
              </div>
            </div>


            {/* Name */}
            <div className="chat-header text-xs opacity-60 mb-1">
              {isUser ? "You" : "AI Agent"}
            </div>


            {/* Message */}
            <div
              className={`chat-bubble whitespace-pre-wrap ${isUser
                ? "chat-bubble-primary"
                : "bg-base-300 text-base-content"
                }`}
            >
              {message.text}
            </div>

          </div>
        );
      })}


      {/* AI typing */}
      {isTyping && (
        <div className="chat chat-start">

          <div className="chat-image avatar placeholder">
            <div className="w-9 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
              <span className="text-xs font-bold">
                AI
              </span>
            </div>
          </div>

          <div className="chat-bubble bg-base-300">
            <span className="loading loading-dots loading-sm" />
          </div>

        </div>
      )}


      <div ref={bottomRef} />

    </div>
  );
};

export default AgentMessageList;