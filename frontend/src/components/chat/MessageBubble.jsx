import { useState } from "react";
import { format } from "date-fns";

function MessageBubble({ message, isOwn }) {
  const [isOpen, setIsOpen] = useState(false);

   const attachment = message.attachments?.[0];
  const isImage = attachment?.mimeType?.startsWith("image/");
  const isVideo = attachment?.mimeType?.startsWith("video/");

  const API_BASE = "http://localhost:5000";

  console.log(attachment)

  return (
    <>
      <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
        {!isOwn && (
          <>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={message.sender.profilePic}
                  alt={message.sender.fullName}
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              {message.sender.fullName}
            </div>
          </>
        )}

        <div
          className={`chat-bubble ${
            isOwn ? "chat-bubble-primary" : ""
          } p-2`}
        >
          {attachment && (

            <>
            {isImage && (
              <img
              src={message.attachments[0].url}
              alt="attachment"
              className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
              onClick={() => setIsOpen(true)}
            />
            )}

            {isVideo && (
              <video controls className="max-w-xs rounded-lg mb-2">
  <source src={
        attachment.manifestId
          ? `${API_BASE}/api/upload/media/${attachment.manifestId}`
          : attachment.url
      } />
</video>
            
            )
          }
          </>
          )}

          {message.text && (
            <p className="break-words">{message.text}</p>
          )}
        </div>

        <div className="chat-footer opacity-60 text-xs mt-1">
          {format(new Date(message.createdAt), "hh:mm a")}
        </div>
      </div>

      {/* Fullscreen Image Preview */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={message.attachments[0].url}
            alt="attachment"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute top-5 right-5 text-white text-4xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

export default MessageBubble;