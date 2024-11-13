"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SearchBox } from "@/components/sidebar/search-box";

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
