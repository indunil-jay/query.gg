import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { orderValues } from "@/components/sidebar/sort-nav";
import { IPostResponse } from "@/types/post";

export const MAX_POST_PER_PAGE = 9;

export const getPosts = async (
  sortBy: string | null = null,
  order: string | null = null,
  page: string
) => {
  const response = await fetch(
    `https://dummyjson.com/posts?page=${page}&limit=${MAX_POST_PER_PAGE}&skip=${
      (+page - 1) * 9
    }${sortBy && order ? `&sortBy=${sortBy}&order=${order}` : ""}`
  );
  if (!response.ok) {
    throw new Error("Error fetching data");
  }
  const data = await response.json();
  const postsResponse = data as IPostResponse;
  return postsResponse;
};

export const usePosts = () => {
  const [order] = useQueryState("order", parseAsStringLiteral(orderValues));
  const [sortBy] = useQueryState("sortBy", parseAsString);
  const [page] = useQueryState("page", parseAsString.withDefault("1"));
  console.log({ page });
  return useQuery({
    queryKey: ["posts", { sortBy, order, page }],
    queryFn: () => getPosts(sortBy, order, page),
    placeholderData: (previousData) => previousData,
    staleTime: 300000,
    enabled: Boolean(sortBy) || Boolean(order) || Boolean(page),
  });
};
