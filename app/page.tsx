"use client";

import Link from "next/link";
import { Bookmark, MessageCircle, RefreshCcw, Share } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPosts } from "@/app/posts/_hooks/use-get-posts";
import { useState } from "react";

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
          <Card key={post.id} className={cn("min-w-[320px] py-2")}>
            <CardHeader className="px-3.5 py-1">
              <div className="flex items-center gap-4">
                <div>
                  <Avatar className="size-16">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`http://localhost:3000/posts/${post.id}`}
                    className="hover:underline underline-offset-2 transition"
                  >
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-1 text-xs">
                    written by • eron james
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4   px-3.5 py-1">
              <p className="text-sm line-clamp-3">{post.body}</p>
            </CardContent>
            <CardFooter className="px-3.5 py-1  flex justify-end">
              <div className="flex">
                <Button variant={"ghost"} size={"sm"}>
                  <MessageCircle className="size-4" />
                  comments
                </Button>
                <Button variant={"ghost"} size={"sm"}>
                  <Bookmark className="size-4" />
                  bookmark
                </Button>
                <Button variant={"ghost"} size={"sm"}>
                  <Share className="size-4" />
                  share
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div>
        {/* pagination */}
        pagination footer
      </div>
    </div>
  );
}
