import { PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/custom/use-user";
import { IComment, ICommentResponse } from "@/types/comment";
import { Loader } from "lucide-react";
import { Error } from "./error";

interface CommentProps {
  commentsResponse: ICommentResponse;
  isCommentsError: boolean;
  isCommentsPending: boolean;
}

export const Comments = ({
  commentsResponse,
  isCommentsError,
  isCommentsPending,
}: CommentProps) => {
  if (isCommentsError) {
    return (
      <PopoverContent align="center" className="w-96">
        <p className="text-sm font-medium text-muted-foreground">
          Error while comment loading
        </p>
      </PopoverContent>
    );
  }

  return (
    <PopoverContent align="center" className="w-96">
      <p className="text-sm font-medium text-muted-foreground">
        Comments (
        {isCommentsPending ? (
          <Loader className="animate-spin size-7" />
        ) : (
          commentsResponse.total
        )}
        )
      </p>
      <ScrollArea className="h-[200px] p-4">
        {isCommentsPending ? (
          "loding"
        ) : (
          <div className="space-y-3">
            {commentsResponse.comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </ScrollArea>
    </PopoverContent>
  );
};

export const CommentCard = ({ comment }: { comment: IComment }) => {
  const { data: user, isLoading, status } = useUser({ id: comment.user.id });
  if (status === "error") {
    return <Error />;
  }
  return (
    <div className="space-y-2">
      {isLoading || status === "pending" ? (
        <Loader className="animate-spin size-7" />
      ) : (
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user.image} alt={user.firstName} />
            <AvatarFallback className="font-semibold">
              {user.firstName.charAt(0).toUpperCase() +
                user.lastName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="line-clamp-1 font-semibold text-sm leading-none capitalize tracking-wide">
              {comment.user.fullName}
            </p>
            <p className="line-clamp-1 text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      )}
      <p className="text-xs text-primary/80">{comment.body}</p>
    </div>
  );
};
