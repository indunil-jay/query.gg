"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/app/_components/ui/sidebar";
import { SearchBox } from "@/app/_components/sidebar/search-box";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Start to Search</SidebarGroupLabel>
      <SidebarMenu>
        <SearchBox />
      </SidebarMenu>
    </SidebarGroup>
  );
}
