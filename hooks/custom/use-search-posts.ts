import { IPost } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";

export const useSearchPosts = () => {
  const [query] = useQueryState("search", parseAsString);

  return useQuery({
    queryKey: ["posts:search", query],
    queryFn: async () => {
      const response = await fetch(
        `https://dummyjson.com/posts/search?q=${query}&limit=5`
      );
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data.posts as IPost[];
    },
    enabled: Boolean(query),
    refetchOnWindowFocus: false,
    gcTime: 60 * 1000,
  });
};
