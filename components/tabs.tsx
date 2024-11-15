"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Tabs = () => {
  const pathname = usePathname();
  return (
    <div className="grid w-full grid-cols-2  h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      <Link
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
          pathname === "/posts" && "bg-background text-foreground shadow"
        )}
        href={"/posts"}
      >
        Posts
      </Link>
      <Link
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
          pathname === "/todos" && "bg-background text-foreground shadow"
        )}
        href={"/todos"}
      >
        Todos
      </Link>
    </div>
  );
};
