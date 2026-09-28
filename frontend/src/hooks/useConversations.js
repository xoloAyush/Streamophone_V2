import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "../lib/api";

const useConversations = () => {

    const {
        data: conversations = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["conversations"],

        queryFn: () =>
            fetchInstance("/chat/conversations"),
    });

    return {
        conversations,
        isLoading,
        error,
    };
};

export default useConversations;