"use client";

import { useTodos } from "@/hooks/custom/use-todos";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Checkbox } from "@/components/ui/checkbox";
import { ITodo } from "@/types/todo";
import { TodoCard } from "./_components/todo-card";

export default function Page() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    status,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useTodos();

  // Intersection observers for top and bottom
  const { ref: bottomRef, inView: bottomInView } = useInView({
    triggerOnce: false,
    threshold: 1.0, // Trigger when fully in view
  });
  const { ref: topRef, inView: topInView } = useInView({
    triggerOnce: false,
    threshold: 1.0,
  });

  useEffect(() => {
    if (bottomInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [bottomInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (topInView && hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }
  }, [topInView, hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error fetching todos</p>;

  // Flatten and combine all pages of todos
  const todos = data.pages.flatMap((page) => page.todos);

  return (
    <div className="p-4">
      {/* Top Loader */}
      <div className="mb-4" ref={hasPreviousPage ? topRef : null}>
        {isFetchingPreviousPage ? (
          <Loader className="animate-spin" />
        ) : hasPreviousPage ? (
          <Loader className="animate-spin" />
        ) : (
          <p>You're at the top!</p>
        )}
      </div>

      {/* Todos List */}
      <div className="space-y-6">
        {todos.map((todo) => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>

      {/* Bottom Loader */}
      <div className="mt-4" ref={hasNextPage ? bottomRef : null}>
        {isFetchingNextPage ? (
          <Loader className="animate-spin" />
        ) : hasNextPage ? (
          <Loader className="animate-spin" />
        ) : (
          <p>You've reached the bottom!</p>
        )}
      </div>
    </div>
  );
}
