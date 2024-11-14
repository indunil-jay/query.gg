"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";

export const orderValues = ["asc", "desc"] as const;

export default function SortNav() {
  const [, setOrder] = useQueryState(
    "order",
    parseAsStringLiteral(orderValues)
  );
  const [, setSortBy] = useQueryState("sortBy", parseAsString);

  const handleOnChangeEvent = useCallback(
    (value: string) => {
      setSortBy("title");
      setOrder(value as (typeof orderValues)[number]);
    },
    [setOrder, setSortBy]
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Sort posts by</SidebarGroupLabel>
      <SidebarMenu>
        <Select onValueChange={handleOnChangeEvent}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Order post by title" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="asc">title (a-z)</SelectItem>
              <SelectItem value="desc">title (z-a)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SidebarMenu>
    </SidebarGroup>
  );
}
