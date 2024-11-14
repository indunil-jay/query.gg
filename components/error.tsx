import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  message?: string;
}

export const Error = ({ message = "Something went wrong!" }: ErrorProps) => {
  return (
    <Card className="max-w-[580px] w-full">
      <CardHeader>
        <div className="flex items-center gap-5">
          <AlertTriangle className="size-10" />
          <CardTitle className="text-4xl">Whoops!</CardTitle>
        </div>
        <CardDescription>
          {" "}
          We encountered an issue while processing your request.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <p className="text-lg">{message}</p>
      </CardContent>

      <CardFooter className="flex justify-end mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </CardFooter>
    </Card>
  );
};
