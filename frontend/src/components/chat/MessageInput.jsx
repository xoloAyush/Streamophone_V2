import { useState, useRef } from "react";
// import { socket } from "../../lib/socket";
import { SendHorizonal, Paperclip } from "lucide-react";

function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  // const [image, setImage] = useState(null);
  const [media, setMedia] = useState(null);

  const sendMessage = () => {
    const message = text.trim();

    if (!message && !media) return;

  onSend({
    text: message,
    media,
  });

  setText("");
  setMedia(null);

   if (fileRef.current) {
    fileRef.current.value = "";
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fileRef= useRef(null)
  
  const handleImage = e => {
    const file = e.target.files[0];

    if(!file) return;

    setMedia(file);
}

  return (
    <div className="border-t bg-base-100 p-4 flex-shrink-0">

       {media && (
    <div className="mb-4">
      {media && (
  media.type.startsWith("image/") ? (
    <img
      src={URL.createObjectURL(media)}
      className="w-40 rounded-xl"
      alt="preview"
    />
  ) : (
    <video
      src={URL.createObjectURL(media)}
      controls
      className="w-40 rounded-xl"
    />
  )
)}
    </div>
  )}
  
      <div className="flex items-center justify-center gap-9 max-w-full ">

        <input
    ref={fileRef}
    type="file"
    accept="image/*,video/*"
    hidden
    onChange={handleImage}
/>

<button
    type="button"
    onClick={() => fileRef.current.click()}
>
    <Paperclip size={20} />
</button>

        <textarea
          rows={1}
          className="p-3 border-2 border-neutral focus:border-accent rounded-xl bg-base-300 w-200 resize-none  focus:outline-none"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="
    flex items-center justify-center
    rounded-full bg-primary p-3
    text-black cursor-pointer
    transition-transform duration-150
    
    active:scale-95
  "
          onClick={sendMessage}
        >
          <SendHorizonal size={18} />
        </button>

      </div>

    </div>
  );
}

export default MessageInput;


// Right now, MessageInput is doing two jobs:

// ✅ Rendering the UI.
// ❌ Handling Socket.IO communication.

// We already decided that ChatPage should own all socket logic.