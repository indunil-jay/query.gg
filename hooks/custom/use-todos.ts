import { ITodo, ITodoResponse } from "@/types/todo";
import { useInfiniteQuery } from "@tanstack/react-query";

export const MAX_TODO_PER_PAGE = 15;

interface PaginatedTodos {
  todos: ITodo[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

const getTodos = async (page: number): Promise<PaginatedTodos> => {
  const response = await fetch(
    `https://dummyjson.com/todos?limit=${MAX_TODO_PER_PAGE}&skip=${
      (page - 1) * MAX_TODO_PER_PAGE
    }`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  const data: ITodoResponse = await response.json();
  const totalPages = Math.ceil(data.total / data.limit);

  return {
    todos: data.todos,
    currentPage: Math.floor(data.skip / data.limit) + 1,
    totalItems: data.total,
    totalPages,
  };
};

export const useTodos = () =>
  useInfiniteQuery({
    queryKey: ["todos"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTodos(pageParam),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const { currentPage, totalPages } = lastPage;
      if (currentPage === totalPages) return undefined;
      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }

      return firstPageParam - 1;
    },
    maxPages: 3,
  });
