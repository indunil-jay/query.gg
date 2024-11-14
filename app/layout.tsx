import type { Metadata } from "next";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@/app/globals.css";
import Providers from "@/app/query-provider";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNav } from "@/components/bread-crumb-nav";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./_fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./_fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Query.gg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <NuqsAdapter>
            <Providers>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-50">
                    <div className="flex flex-1 items-center gap-2 px-3">
                      <SidebarTrigger />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                      <BreadcrumbNav />
                    </div>
                  </header>
                  <main className="bg-muted min-h-[calc(100vh-56px)] flex flex-col justify-between">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </Providers>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
