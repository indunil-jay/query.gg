import { ICommentResponse } from "@/types/comment";
import { useQuery } from "@tanstack/react-query";

export const useGetComments = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["post:comments", { id }],
    queryFn: async () => {
      const response = await fetch(
        `https://dummyjson.com/posts/${id}/comments`
      );
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data as ICommentResponse;
    },
    enabled: !!id,
  });
};
