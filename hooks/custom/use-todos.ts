import { ITodoResponse } from "@/types/todo";
import { useInfiniteQuery } from "@tanstack/react-query";

export const MAX_TODO_PER_PAGE: number = 18;

const getTodos = async (page: number) => {
  const response = await fetch(
    `https://dummyjson.com/todos?limit=${MAX_TODO_PER_PAGE}&skip=${
      (page - 1) * MAX_TODO_PER_PAGE
    }`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  const data = (await response.json()) as ITodoResponse;
  const totalPages = Math.ceil(data.total / MAX_TODO_PER_PAGE);
  const currentPage = page;
  const totalItems = data.total;
  const todos = data.todos;
  return { todos, currentPage, totalItems, totalPages };
};

export const useTodos = () =>
  useInfiniteQuery({
    queryKey: ["todos"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTodos(pageParam),
    getNextPageParam: (
      { currentPage, totalPages },
      allPages,
      lastPageParam
    ) => {
      const nextPage = currentPage + 1;
      if (nextPage > totalPages) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: ({ currentPage }, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
    maxPages: 3,
  });
