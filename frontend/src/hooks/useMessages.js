import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "../lib/api";

const useMessages = (friendId) => {

    const {
        data: messages = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ["messages", friendId],

        queryFn: () =>
            fetchInstance(`/chat/:${friendId}`),

        enabled: !!friendId,
    });

    return {
        messages,
        isLoading,
        error,
    };
};

export default useMessages;