import { IPost } from "@/types/post";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { useUser } from "@/hooks/custom/use-user";

export const SearchResultItem = ({ post }: { post: IPost }) => {
  const { data: user, isLoading } = useUser({ id: post.userId });
  if (!user) return;
  const fullName = user.firstName + " " + user.lastName;
  return (
    <div className="flex gap-3 items-center">
      <Avatar>
        <AvatarImage src={post.imageUrl} alt={post.title} />
        <AvatarFallback>{post.title.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="font-semibold leading-none">{post.title}</p>
        <p className="line-clamp-1 text-[10px] leading-none">
          written by • {fullName}
        </p>
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
  );
};
