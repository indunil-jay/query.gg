import { Checkbox } from "@/components/ui/checkbox";
import { ITodo } from "@/types/todo";

export function TodoCard({ todo }: { todo: ITodo }) {
  return (
    <div className="flex items-center space-x-4">
      <Checkbox id="terms" />
      <span className="text-2xl">#{todo.id}</span>
      <label
        htmlFor="terms"
        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {todo.todo}
      </label>
    </div>
  );
}
