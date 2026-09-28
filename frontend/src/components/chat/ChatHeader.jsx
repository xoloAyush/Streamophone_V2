import { Phone, Video } from "lucide-react";

function ChatHeader({ friend }) {

  if (!friend) return null;

  return (
    <div className="border-b bg-base-100 px-5 py-3 flex items-center w-full justify-between ">

      <div className="flex items-center gap-3">

        <div className="avatar">
          <div className="w-12 rounded-full">
            <img
              src={friend.profilePic}
              alt={friend.fullName}
            />
          </div>
        </div>

        <div>

          <h2 className="font-semibold">
            {friend.fullName}
          </h2>

          <p className="text-sm opacity-70">
            {friend.nativeLanguage} → {friend.learningLanguage}
          </p>

        </div>

      </div>

      <div className="flex gap-12">

        <button className="p-3 rounded-xl hover:bg-neutral cursor-pointer">
          <Phone size={20} />
        </button>

        <button className="p-3 rounded-xl hover:bg-neutral cursor-pointer">
          <Video size={20} />
        </button>

      </div>

    </div>
  );
}

export default ChatHeader;