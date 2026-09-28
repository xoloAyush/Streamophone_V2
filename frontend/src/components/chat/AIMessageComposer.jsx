
import { useAI } from "../hooks/useAI";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/userAuthUser";

const AIMessageComposer = ({ targetUser }) => {
  const { textComposer } = useMessageComposerController();
  const { authUser } = useAuthUser();

  const {
    translate,
    improve,
    friendly,
    formal,
    translating,
    improving,
    makingFriendly,
    makingFormal,
  } = useAI();

  const runAndSet = async (fn, args, errMsg) => {
    try {
      const currentText = textComposer.text; // read current value at click time
      const res = await fn({ ...args, text: currentText });
      textComposer.setText(res.text); // write back into the composer
    } catch (err) {
      toast.error(err.message || errMsg);
    }
  };


  const handleTranslate = () => {
    const currentText = textComposer.text.trim();

    console.log({
      text: translate,
      from: authUser.nativeLanguage,
      to: targetUser,
    });

    if (!currentText) {
      return toast.error("Please type a message first.");

    }

    runAndSet(
      translate,
      {
        from: authUser.nativeLanguage,
        to: targetUser.nativeLanguage,
      },
      "Translation failed"
    );
  };
  const handleImprove = () => runAndSet(improve, {}, "Improve failed");
  const handleFriendly = () => runAndSet(friendly, {}, "Friendly rewrite failed");
  const handleFormal = () => runAndSet(formal, {}, "Formal rewrite failed");

  return (
    <div className="flex flex-nowrap items-center gap-2 border-b p-2 overflow-x-auto text-white">
      <button
        onClick={handleTranslate}
        disabled={translating}
        className="w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all
                        shrink-1 "
      >
        {translating ? "..." : "🌐 Translate"}
      </button>

      <button
        onClick={handleImprove}
        disabled={improving}
        className="w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all
                        shrink-1 "
      >
        {improving ? "..." : "✨ Improve"}
      </button>

      <button
        onClick={handleFriendly}
        disabled={makingFriendly}
        className="w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all
                        shrink-1 "
      >
        {makingFriendly ? "..." : "😊 Friendly"}
      </button>

      <button
        onClick={handleFormal}
        disabled={makingFormal}
        className="w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all
                        shrink-1 "
      >
        {makingFormal ? "..." : "💼 Formal"}
      </button>
    </div>
  );
};

export default AIMessageComposer;