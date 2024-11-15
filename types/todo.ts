export interface ITodo {
  id: string;
  todo: string;
  completed: boolean;
  userId: string;
}

export interface ITodoResponse {
  todos: ITodo[];
  total: number;
  skip: number;
  limit: number;
}
