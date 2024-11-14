import { ICommentResponse } from "@/types/comment";
import { useQuery } from "@tanstack/react-query";

export const getComments = (postId: string) => ({
  queryKey: ["post:comments", { postId }],
  queryFn: async () => {
    const response = await fetch(
      `https://dummyjson.com/posts/${postId}/comments`
    );
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const data = await response.json();
    return data as ICommentResponse;
  },
  enabled: !!postId,
});

export const useComments = ({ postId }: { postId: string }) =>
  useQuery({ ...getComments(postId) });
