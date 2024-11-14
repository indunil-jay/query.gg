"use client";

import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Spinner } from "@/components/loader";
import { Error } from "@/components/error";
import { usePosts } from "@/hooks/custom/use-posts";

export default function Page() {
  const {
    data: postQueryData,
    status,
    isLoading,
    isFetching,
    refetch,
  } = usePosts();
  const [lastFetched, setLastFetched] = useState(new Date());

  if (status === "pending" || isLoading) {
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
          <p className="text-sm">
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
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 content-center">
          {postQueryData.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <footer className="h-16 px-4 w-full bg-white flex-grow-0">
        {/* pagination */}
        pagination footer
      </footer>
    </>
  );
}
