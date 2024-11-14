import { cn } from "@/lib/utils";
import Link from "next/link";

import { Popover, PopoverTrigger } from "@/components/ui/popover";
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
import { Bookmark, MessageCircle, Share } from "lucide-react";
import { IPost } from "@/types/post";
import { useGetUser } from "@/app/users/_hooks/use-user";
import { Badge } from "./ui/badge";
import { Comments } from "./comments";
import { CopyToClipboardBtn } from "./copy-to-clipboard-btn";

export const PostCard = ({ post }: { post: IPost }) => {
  const { data: user, isLoading } = useGetUser({ id: post.userId });
  if (!user) return;
  const fullName = user.firstName + " " + user.lastName;
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
            >
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            </Link>
            <CardDescription className="line-clamp-1 text-xs">
              written by • {fullName}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"ghost"} size={"sm"}>
                <MessageCircle className="size-4" />
                comments
              </Button>
            </PopoverTrigger>
            <Comments postId={post.id} />
          </Popover>

          <Button variant={"ghost"} size={"sm"}>
            <Bookmark className="size-4" />
            bookmark
          </Button>
          <CopyToClipboardBtn postId={post.id} />
        </div>
      </CardFooter>
    </Card>
  );
};
