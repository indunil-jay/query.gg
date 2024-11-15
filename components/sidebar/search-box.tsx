"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useSearchPosts } from "@/hooks/custom/use-search-posts";
import { useQueryState } from "nuqs";
import { IPost } from "@/types/post";
import { useRouter } from "next/navigation";
import { SearchResultItem } from "./search-result-item";

const MAX_RECENT_ITEMS = 3;

export function SearchBox() {
  const [open, setOpen] = React.useState(false);
  const [, setQuery] = useQueryState("search");
  const { data: searchResults, isLoading } = useSearchPosts();
  const [recentPosts, setRecentPosts] = React.useState<IPost[]>([]);
  const router = useRouter();

  // Load recent search items from localStorage when the dialog opens
  React.useEffect(() => {
    if (open) {
      const storedItems = JSON.parse(
        localStorage.getItem("recentItems") || "[]"
      ) as IPost[];
      setRecentPosts(storedItems);
    }
  }, [open]);

  // Update recent posts in localStorage when a post is clicked (not when search results are fetched)
  const handleSelect = (id: string) => {
    // Find the post from the search results
    const selectedPost = [...(searchResults ?? []), ...recentPosts].find(
      (post) => post.id === id
    );
    if (selectedPost) {
      // Add to recent posts if not already present
      const updatedRecentPosts = [selectedPost, ...recentPosts]
        .filter(
          (post, index, self) =>
            self.findIndex((p) => p.id === post.id) === index
        ) // Remove duplicates
        .slice(0, MAX_RECENT_ITEMS);

      // Save the updated list of recent posts to localStorage
      localStorage.setItem("recentItems", JSON.stringify(updatedRecentPosts));
      setRecentPosts(updatedRecentPosts);

      router.push(`/posts/${id}`);

      setOpen(false);
    }
  };

  // Clear query when dialog is closed
  React.useEffect(() => {
    if (!open && !recentPosts) {
      setQuery(null);
    }
  }, [open, setQuery, recentPosts]);

  // Handle keyboard shortcut to toggle search dialog
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div
        className="flex justify-between items-center border h-9 rounded-md px-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-sm text-muted-foreground">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </kbd>
        </p>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          onValueChange={(value) => setQuery(value)}
          placeholder="Type a name or tag..."
        />
        <CommandList>
          <CommandGroup heading="Current Search Results">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              searchResults?.map((post) => (
                <CommandItem
                  key={post.id}
                  onSelect={() => handleSelect(post.id)}
                >
                  <SearchResultItem post={post} />
                </CommandItem>
              ))
            )}
          </CommandGroup>

          <CommandGroup heading="Recent Search Results">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <CommandItem
                  key={post.id}
                  onSelect={() => handleSelect(post.id)}
                >
                  <SearchResultItem post={post} />
                </CommandItem>
              ))
            ) : (
              <p>No recent searches.</p>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
