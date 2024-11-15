import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { orderValues } from "@/components/sidebar/sort-nav";
import { IPostResponse } from "@/types/post";

export const getPosts = (
  sortBy: string | null = null,
  order: string | null = null,
  page: string
) => ({
  queryKey: ["posts", { sortBy, order, page }],
  queryFn: async () => {
    const response = await fetch(
      `https://dummyjson.com/posts?page=${page}&limit=9&skip=${
        (+page - 1) * 9
      }${sortBy && order ? `&sortBy=${sortBy}&order=${order}` : ""}`
    );
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const data = await response.json();
    const postsResponse = data as IPostResponse;
    return postsResponse;
  },
});

export const usePosts = () => {
  const [order] = useQueryState("order", parseAsStringLiteral(orderValues));
  const [sortBy] = useQueryState("sortBy", parseAsString);
  const [page] = useQueryState("page", parseAsString.withDefault("1"));
  return useQuery({
    ...getPosts(sortBy, order, page),
  });
};
