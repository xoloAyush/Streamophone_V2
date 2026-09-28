import { useEffect, useRef } from "react";
import  useAuthUser from "../../hooks/userAuthUser";
import MessageBubble from "./MessageBubble";

function MessageList({ messages }) {
  const bottomRef = useRef(null);

  const { authUser } = useAuthUser();

  // console.log(messages);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-base-content/60">
        No messages yet.
        <br />
        Start the conversation 👋
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">

      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.sender._id === authUser._id}
        />
      ))}

      <div ref={bottomRef} />

    </div>
  );
}

export default MessageList;