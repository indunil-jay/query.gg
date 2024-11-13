import { IPost } from "@/types/post";
import { useQuery } from "@tanstack/react-query";

export const useGetPost = ({ id }: { id: string }) =>
  useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const response = await fetch(`https://dummyjson.com/posts/${id}`);
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data as Promise<IPost>;
    },
  });
