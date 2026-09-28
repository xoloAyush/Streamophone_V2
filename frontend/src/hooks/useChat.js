import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "../lib/api";

const useChat = (friendId) => {

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["chat", friendId],

        queryFn: () =>
            fetchInstance(`/chat/${friendId}`),

        enabled: !!friendId,
    });

    return {
        friend: data?.friend,
        conversation: data?.conversation,
        messages: data?.messages ?? [],
        isLoading,
        error,
    };
};

export default useChat;