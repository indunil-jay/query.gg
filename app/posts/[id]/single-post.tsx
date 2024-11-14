"use client";

import { Bookmark, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPost } from "@/app/posts/_hooks/use-get-post";
import { useGetUser } from "@/app/users/_hooks/use-user";
import { Badge } from "@/components/ui/badge";

interface PostProps {
  id: string;
}

export const Post = ({ id }: PostProps) => {
  const { data, error, isLoading } = useGetPost({ id });
  const { data: user, isLoading: isUserLoading } = useGetUser({
    id: data?.userId,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  if (!data) return;

  if (!user) return;
  const fullName = user.firstName + " " + user.lastName;
  return (
    <div className="h-full p-4">
      <Card className="h-[calc(100vh-(32px+56px))]">
        <CardHeader>
          <CardTitle className="text-4xl line-clamp-2 hover:line-clamp-none cursor-pointer">
            {data.title}
          </CardTitle>
          <div className="flex gap-2">
            {data.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-sm font-normal leading-snug tracking-wider rounded-lg  px-1.5 py-0"
              >
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Avatar className="size-10">
                <AvatarImage src={user.image} alt={fullName} />
                <AvatarFallback>
                  {user.firstName.charAt(0).toUpperCase() +
                    user.lastName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="">
              <p className="font-semibold text-sm capitalize text-muted-foreground">
                {fullName}
              </p>
              <p className="text-xs text-muted-foreground/70">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 h-full">
            <Avatar className="w-full h-full rounded-md">
              <AvatarImage
                className="w-full h-full rounded-md"
                src={data.imageUrl}
                alt={data.title}
              />
              <AvatarFallback className="w-full h-full rounded-md text-8xl">
                {data.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="">
              <ScrollArea className="h-80 rounded-md border p-4">
                <p className="">{data?.body}</p>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-3.5 pt-2.5  flex justify-end ">
          <div className="flex">
            <Button variant={"ghost"} className="">
              <MessageCircle className="size-4" />
              comments
            </Button>
            <Button variant={"ghost"} className="">
              <Bookmark className="size-4" />
              bookmark
            </Button>
            <Button variant={"ghost"} className="">
              <Share className="size-4" />
              share
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
