import { useParams } from "react-router";
import { useCallback,useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import useChat from "../hooks/useChat";
import useSocket from "../hooks/useSocket";
import { socket } from "../lib/socket";

import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

import { uploadImage } from "../lib/uploadImage";

function ChatPage() {
  const { id: friendId } = useParams();

  const queryClient = useQueryClient();

  const {
    friend,
    // conversation,
    messages,
    isLoading,
  } = useChat(friendId);

  const handleSend = useCallback(async ({ text, media  }) => 
    {

    let attachments = [];
    let type = "text";

    if (media ) {
    // const response = await uploadImage(media );
    const response = await uploadImage(media, (pct) => console.log(`${pct}%`));

    attachments = [
        {
            url: response.url,
            mimeType: media.type,
            manifestId: response.manifestId ?? null,
            fileName: media.name,
            size: media.size,
        },
    ];

     type = media.type.startsWith("video/")
    ? "video"
    : "image";
}

const payload = {
  receiverId: friend._id,
  text,
  type,
  attachments,
};

// console.log("Sending:", payload);

socket.emit("send-message", payload);
    return friend._id
  },
  [friend]
);

  const handleReceive = useCallback(
    (message) => {
      // console.log("Received message:", message);

      queryClient.setQueryData(["chat", friendId], (old) => {
        // console.log("Old cache:", old);

        if (!old) return old;

        return {
          ...old,
          messages: [...old.messages, message],
        };
      });
    },
    [friendId, queryClient]
  );

  const events = useMemo(
  () => ({
    "receive-message": handleReceive,
  }),
  [handleReceive]
);

useSocket(events);

  // useSocket({"receive-message": handleReceive});

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      <ChatHeader
        friend={friend}
      />

      <MessageList
        messages={messages}
      />

      <MessageInput
        onSend={handleSend}
      />

    </div>
  );
}

export default ChatPage;