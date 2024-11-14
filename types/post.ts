export interface IPost {
  id: string;
  title: string;
  body: string;
  tags: string[];
  imageUrl?: string;
  userId: string;
}

export interface IPostResponse {
  posts: IPost[];
  total: number;
  skip: number;
  limit: number;
}
