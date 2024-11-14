"use client";

import { Bookmark, MessageCircle, RefreshCcw, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPosts } from "@/app/posts/_hooks/use-get-posts";
import { useState } from "react";
import { PostCard } from "@/components/post-card";

export default function Page() {
  const { data, error, isLoading, isFetching, refetch } = useGetPosts();
  const [lastFetched, setLastFetched] = useState(new Date());

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  const handleRefetch = () => {
    refetch();
    setLastFetched(new Date());
  };

  return (
    <div className="flex flex-1 space-y-2 flex-col p-4 bg-muted">
      <div className="flex items-center space-x-2 bg-white justify-end self-end  rounded-md px-3 ">
        <p className="text-sm">Last updated • {lastFetched.toLocaleString()}</p>
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
        {data?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div>
        {/* pagination */}
        pagination footer
      </div>
    </div>
  );
}
