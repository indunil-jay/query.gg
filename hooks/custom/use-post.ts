import { IPost } from "@/types/post";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const getPost = (postId: string) => ({
  queryKey: ["posts", { postId }],
  queryFn: async () => {
    const response = await fetch(`https://dummyjson.com/posts/${postId}`);
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const data = await response.json();
    return data as Promise<IPost>;
  },
  enabled: Boolean(postId),
  staleTime: 5000,
});

export const usePost = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();
  return useQuery({
    ...getPost(postId),
    initialData: () => {
      // console.log("cache query:", queryClient.getQueryData(["posts"]));
      return (queryClient.getQueryData(["posts"]) as IPost[])?.find(
        (post) => post.id === postId
      );
    },
  });
};
