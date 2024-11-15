"use client";
import { useTodos } from "@/hooks/custom/use-todos";
import { TodoCard } from "./_components/todo-card";
import { Loader } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersectionObserver";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const {
    data,
    fetchNextPage,
    status,
    hasNextPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = useTodos();

  const { isIntersecting: isIntersectingBottom, ref: bottomRef } =
    useIntersectionObserver({
      threshold: 0.5,
    });
  console.log(isIntersectingBottom);

  const { isIntersecting: isIntersectingTop, ref: topRef } =
    useIntersectionObserver({
      threshold: 0.5,
    });

  useEffect(() => {
    if (isIntersectingBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersectingBottom, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isIntersectingTop && hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }
  }, [isIntersectingTop, hasPreviousPage, isFetchingPreviousPage]);

  if (status === "pending") return "pending";
  if (status === "error") return "error";

  const todos = [...data.pages.flatMap((page) => page.todos)];

  return (
    <div className="p-4">
      <div ref={topRef}>
        {isFetchingPreviousPage ? (
          <Loader className="animate-spin" />
        ) : hasPreviousPage ? (
          <Loader className="animate-spin" />
        ) : (
          "you are in top"
        )}
      </div>

      <div className="space-y-6">
        {todos.map((todo, index) => (
          <TodoCard key={index} todo={todo} />
        ))}
      </div>
      {hasNextPage ? (
        <>
          {isFetchingNextPage ? (
            <Loader className="animate-spin" />
          ) : (
            <div ref={bottomRef} />
          )}
        </>
      ) : (
        <Button>Back to Top</Button>
      )}
    </div>
  );
}
