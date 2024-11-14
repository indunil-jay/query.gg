import { cn } from "@/lib/utils";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IPost } from "@/types/post";
import { useUser } from "@/hooks/custom/use-user";
import { Badge } from "./ui/badge";
import { CopyToClipboardBtn } from "./copy-to-clipboard-btn";
import { Error } from "./error";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getPost } from "@/hooks/custom/use-post";

export const PostCard = ({ post }: { post: IPost }) => {
  const { data: user, status, isLoading } = useUser({ id: post.userId });

  const queryClient = useQueryClient();

  if (status === "error") {
    return (
      <div className="flex items-center w-full h-full justify-center">
        <Error message="Something went while fetching user." />
      </div>
    );
  }

  return (
    <Card className={cn("min-w-[320px] py-2")}>
      <CardHeader className="px-3.5 py-1">
        <div className="flex items-center gap-4">
          <div>
            <Avatar className="size-16">
              <AvatarImage src={post.imageUrl} alt={post.title} />
              <AvatarFallback>
                {post.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-1">
            <Link
              href={`http://localhost:3000/posts/${post.id}`}
              className="hover:underline underline-offset-2 transition"
              onMouseEnter={() => {
                queryClient.prefetchQuery(getPost(post.id.toString()));
              }}
            >
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            </Link>
            <CardDescription className="line-clamp-1 text-xs">
              {status === "pending" || isLoading ? (
                <Loader className="size-2" />
              ) : (
                <span>{`${user.firstName} ${user.lastName}`}</span>
              )}
            </CardDescription>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[9px] font-normal leading-snug tracking-wider rounded-lg  px-1.5 py-0"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4   px-3.5 py-1">
        <p className="text-sm line-clamp-3">{post.body}</p>
      </CardContent>
      <CardFooter className="px-3.5 py-1  flex justify-end">
        <div className="flex">
          <CopyToClipboardBtn postId={post.id} />
        </div>
      </CardFooter>
    </Card>
  );
};
