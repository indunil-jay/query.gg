import { getComments } from "@/hooks/custom/use-comments";
import { getPost } from "@/hooks/custom/use-post";
import { ICommentResponse } from "@/types/comment";
import { IPost } from "@/types/post";
import { useQueries } from "@tanstack/react-query";

export const getPostDetails = (postId: string) => [
  { ...getPost(postId) },
  { ...getComments(postId) },
];

export const usePostDetails = ({ postId }: { postId: string }) => {
  return useQueries({
    queries: [...getPostDetails(postId)],

    combine: (queries) => {
      const isPending = queries.some((query) => query.status === "pending");
      const isError = queries.some((query) => query.status === "error");
      const [postQuery, commentsQuery] = queries;

      const isPostPending = postQuery.isPending;
      const isPostError = postQuery.isError;
      const isCommentsPending = commentsQuery.isPending;
      const isCommentsError = commentsQuery.isError;

      const post: IPost = postQuery.data as IPost;
      const isPostPlaceHolder = postQuery.isPlaceholderData;
      const comments: ICommentResponse = commentsQuery.data as ICommentResponse;

      const postStatus = postQuery.status;
      const commentsStatus = commentsQuery.status;

      return {
        post,
        comments,
        postStatus,
        isPostPending,
        commentsStatus,
        isPostError,
        isCommentsPending,
        isCommentsError,
        isPending,
        isError,
        isPostPlaceHolder,
      };
    },
  });
};
