import { IPost } from "@/types/post";
import { useQuery } from "@tanstack/react-query";

export const useGetPosts = () =>
  useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("https://dummyjson.com/posts");
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data.posts as Promise<IPost[]>;
    },
  });
