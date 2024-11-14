export interface IComment {
  id: string;
  body: string;
  postId: string;
  user: {
    id: string;
    fullName: string;
  };
}

export interface ICommentResponse {
  comments: IComment[];
  total: number;
  skip: number;
  limit: number;
}
