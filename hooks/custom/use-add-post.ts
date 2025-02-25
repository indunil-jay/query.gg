import { useMutation, useQueryClient } from "@tanstack/react-query";

const addPost = async (data: object) => {
    const res = await fetch("https://dummyjson.com/posts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 5,
            ...data,
        }),
    });
    return await res.json();
};

export const useAddPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            return queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};
