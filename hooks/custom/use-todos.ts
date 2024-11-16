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
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { currentPage } = firstPage;
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
    maxPages: 3,
  });
