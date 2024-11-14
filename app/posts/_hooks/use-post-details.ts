import { getComments } from "@/hooks/custom/use-comments";
import { getPost } from "@/hooks/custom/use-post";
import { useQueries } from "@tanstack/react-query";

export const usePostDetails = ({ postId }: { postId: string }) => {
  return useQueries({
    queries: [{ ...getPost(postId) }, { ...getComments(postId) }],
    combine: (queries) => {
      const isPending = queries.some((query) => query.status === "pending");
      const isError = queries.some((query) => query.status === "error");
      const [postQuery, commentsQuery] = queries;

      const isPostPending = postQuery.isPending;
      const isPostError = postQuery.isError;
      const isCommentsPending = commentsQuery.isPending;
      const isCommentsError = commentsQuery.isError;

      const post = postQuery.data;
      const comments = commentsQuery.data;

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
      };
    },
  });
};
