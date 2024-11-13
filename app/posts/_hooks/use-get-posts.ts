import { orderValues } from "@/components/sidebar/sort-nav";
import { IPost } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

export const useGetPosts = () => {
  const [order] = useQueryState("order", parseAsStringLiteral(orderValues));
  const [sortBy] = useQueryState("sortBy", parseAsString);

  let url: string = `https://dummyjson.com/posts`;

  if (sortBy && order) {
    url += `?sortBy=${sortBy}&order=${order}`;
  }

  return useQuery({
    queryKey: ["posts", { sortBy, order }],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data.posts as IPost[];
    },
  });
};
