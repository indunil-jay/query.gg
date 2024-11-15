"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Spinner } from "@/components/loader";
import { Error } from "@/components/error";
import { usePosts } from "@/hooks/custom/use-posts";
import { PaginationBar } from "@/components/pagination-bar";
import { TabsContent } from "@/components/ui/tabs";

export default function Page() {
  const {
    data: postQueryData,
    status,
    isFetching,
    refetch,
    isPlaceholderData,
  } = usePosts();
  const [lastFetched, setLastFetched] = useState(new Date());

  useEffect(() => {
    if (status === "success" && !isFetching && !isPlaceholderData) {
      setLastFetched(new Date());
    }
  }, [status, isFetching, isPlaceholderData]);

  if (status === "pending") {
    return <Spinner />;
  }

  if (status === "error") {
    return (
      <div className="flex items-center w-full h-full justify-center">
        <Error message="Something went while fetching posts." />
      </div>
    );
  }

  const handleRefetch = () => {
    refetch();
    setLastFetched(new Date());
  };

  return (
    <>
      <div className="p-4 space-y-2 flex flex-1  flex-col">
        <div className="flex items-center space-x-2 bg-white  self-end   rounded-md px-3 ">
          <p className="text-xs  lg:text-sm ">
            Last updated • {lastFetched.toLocaleString()}
          </p>
          <Button
            variant={"ghost"}
            onClick={handleRefetch}
            className="flex items-center bg-transparent hover:bg-transparent"
          >
            Refresh{" "}
            <RefreshCcw className={cn("ml-1", isFetching && "animate-spin")} />
          </Button>
        </div>

        <div
          className={cn(
            "grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 content-center",
            isPlaceholderData ? "opacity-50" : "opacity-100"
          )}
        >
          {postQueryData.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <footer className="h-16 px-4 w-full bg-white flex-grow-0 flex items-center justify-center">
        <PaginationBar
          isPlaceholderData={isPlaceholderData}
          limit={postQueryData.limit}
          totalPages={Math.ceil(Number(postQueryData.total) / 9)}
        />
      </footer>
    </>
  );
}
