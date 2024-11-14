import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { orderValues } from "@/components/sidebar/sort-nav";
import { IPostResponse } from "@/types/post";

export const useGetPosts = () => {
  const [order] = useQueryState("order", parseAsStringLiteral(orderValues));
  const [sortBy] = useQueryState("sortBy", parseAsString);

  let url: string = `https://dummyjson.com/posts?limit=9`;

  if (sortBy && order) {
    url += `?sortBy=${sortBy}&order=${order}`;
  }

  return useQuery({
    queryKey: ["posts", { sortBy, order, url }],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      const postsResponse = data as IPostResponse;
      return postsResponse;
    },
  });
};
