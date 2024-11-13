"use client";
import { AppSidebar } from "@/app/_components/app-sidebar";
import { Separator } from "@/app/_components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/_components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { IPost } from "./types/post";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import { cn } from "./_lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./_components/ui/avatar";
import { Button } from "./_components/ui/button";
import { ChartGanttIcon, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await fetch("https://dummyjson.com/posts");
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      return data.posts as Promise<IPost[]>;
    },
  });
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-50">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Project Management & Task Tracking
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
          </div>
        </header>
        <div className="flex flex-1 flex-col  p-4 bg-muted">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 content-center">
            {data?.map((post) => (
              <Card key={post.id} className={cn("min-w-[320px] py-2")}>
                <CardHeader className="px-3.5 py-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <Avatar className="size-16">
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href={`#`}
                        className="hover:underline underline-offset-2 transition"
                      >
                        <CardTitle className="line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="line-clamp-1 text-xs">
                        written by • eron james
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4   px-3.5 py-1">
                  <p className="text-sm line-clamp-3">{post.body}</p>
                </CardContent>
                <CardFooter className="px-3.5 py-1  flex justify-end">
                  <Button variant={"ghost"} className="">
                    <MessageCircle className="size-4" />
                    comments
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
