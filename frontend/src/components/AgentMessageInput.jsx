import { useState } from "react";
import { SendIcon } from "lucide-react";

const AgentMessageInput = ({ onSend }) => {

    const [text, setText] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!text.trim()) return;

        onSend(text);

        setText("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-base-300 p-4"
        >

            <div className="flex gap-2">

                <input
                    type="text"
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    placeholder="Type a message..."
                    className="input input-bordered flex-1"
                />

                <button
                    type="submit"
                    className="bg-primary p-3 text-primary-content rounded-2xl"
                >
                    <SendIcon className="size-5" />
                </button>

            </div>

        </form>
    );
};

export default AgentMessageInput;