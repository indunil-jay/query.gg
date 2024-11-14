import { IPost } from "@/types/post";
import { useQuery } from "@tanstack/react-query";

export const getPost = (postId: string) => ({
  queryKey: ["book", { postId }],
  queryFn: async () => {
    const response = await fetch(`https://dummyjson.com/posts/${postId}`);
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const data = await response.json();
    return data as Promise<IPost>;
  },
  enabled: Boolean(postId),
});

export const usePost = ({ postId }: { postId: string }) =>
  useQuery({ ...getPost(postId) });
