"use client";

import { Bookmark, Loader, MessageCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Comments } from "@/components/comments";
import { CopyToClipboardBtn } from "@/components/copy-to-clipboard-btn";
import { usePostDetails } from "../_hooks/use-post-details";
import { useUser } from "@/hooks/custom/use-user";
import { usePost } from "@/hooks/custom/use-post";

export const Post = ({ postId }: { postId: string }) => {
  // const {
  //   post,
  //   comments,
  //   isCommentsError,
  //   isCommentsPending,
  //   isPostPending,
  //   postStatus,
  // } = usePostDetails({ postId });
  const { data: post, isPlaceholderData, isError } = usePost({ postId });

  const {
    data: user,
    isLoading: isUserLoading,
    status,
  } = useUser({
    id: post?.id,
  });

  if (isError) return "Error";

  if (!post) return;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Anonymous";
  return (
    <div className="h-full p-4">
      <Card className="h-[calc(100vh-(32px+56px))]">
        <CardHeader>
          <CardTitle className="text-4xl line-clamp-2 hover:line-clamp-none cursor-pointer">
            {post.title}
          </CardTitle>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
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
              {!(status === "success") ? (
                "fetching..."
              ) : (
                <>
                  <Avatar className="size-10">
                    <AvatarImage src={user.image} alt={user?.email} />
                    <AvatarFallback>
                      {user.firstName.charAt(0).toUpperCase() +
                        user.lastName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
            <div className="">
              <p className="font-semibold text-sm capitalize text-muted-foreground">
                {fullName}
              </p>
              <p className="text-xs text-muted-foreground/70">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 h-full">
            <Avatar className="w-full h-full rounded-md">
              <AvatarImage
                className="w-full h-full rounded-md"
                src={post.imageUrl}
                alt={post.title}
              />
              <AvatarFallback className="w-full h-full rounded-md text-8xl">
                {post.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="">
              <ScrollArea className="h-72 p-4">
                {isPlaceholderData ? (
                  <Loader className="animate-spin" />
                ) : (
                  <p className="">{post?.body}</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-3.5 pt-2.5  flex justify-end ">
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                  <MessageCircle className="size-4" />
                  comments
                </Button>
              </PopoverTrigger>
              {/* {!comments ? (
                <PopoverContent align="center" className="w-96">
                  <p className="text-sm font-medium text-muted-foreground">
                    No Comments
                  </p>
                </PopoverContent>
              ) : (
                <Comments
                  commentsResponse={comments}
                  isCommentsError={isCommentsError}
                  isCommentsPending={isCommentsPending}
                />
              )} */}
            </Popover>
            <Button variant={"ghost"} className="">
              <Bookmark className="size-4" />
              bookmark
            </Button>
            <CopyToClipboardBtn postId={post?.id} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
