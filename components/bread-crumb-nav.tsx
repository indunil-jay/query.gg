"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export const BreadcrumbNav = () => {
  const pathname = usePathname();
  const urlSlices = pathname.split("/").filter((slice) => slice !== "");

  const breadcrumbs = urlSlices.map((url, index) => {
    const href = `/${urlSlices.slice(0, index + 1).join("/")}`;
    return { href, label: url.charAt(0).toUpperCase() + url.slice(1) };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 0 &&
          breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
