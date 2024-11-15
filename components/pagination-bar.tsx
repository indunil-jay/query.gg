import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { useQueryState } from "nuqs";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  limit: number;
  totalPages: number;
}

export const PaginationBar = ({ limit, totalPages }: PaginationBarProps) => {
  const [page] = useQueryState("page", { defaultValue: "1" });
  const isMobile = useIsMobile();

  const currentPage = parseInt(page);
  const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
  const prevPage = currentPage > 1 ? currentPage - 1 : 1;
  const pageHref = (pageNum: number) => `/?page=${pageNum}&limit=${limit}`;
  const renderPageLink = (pageNum: number) => (
    <PaginationItem key={pageNum}>
      <Button
        className={`border rounded-md  ${
          currentPage === pageNum
            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground/90"
            : ""
        }`}
        aria-label={`page-number-${currentPage}`}
        size="icon"
        variant={"secondary"}
        asChild
      >
        <Link href={pageHref(pageNum)}>{pageNum}</Link>
      </Button>
    </PaginationItem>
  );

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <Button
            aria-label="Go to previous page"
            size="default"
            className={cn(
              "gap-1 pl-2.5",
              "hover:bg-primary hover:text-muted transition"
            )}
            variant={"secondary"}
            asChild
          >
            <Link
              href={pageHref(prevPage)}
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
              className={
                currentPage <= 1 ? " opacity-50 cursor-not-allowed" : undefined
              }
            >
              {isMobile ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </>
              )}
            </Link>
          </Button>
        </PaginationItem>

        {/* First Page Link */}
        {renderPageLink(1)}

        {/* Second Page Link */}
        {totalPages > 1 && renderPageLink(2)}

        {/* Ellipsis and Active Page */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Current Active Page */}
        {currentPage > 2 &&
          currentPage < totalPages - 1 &&
          renderPageLink(currentPage)}

        {/* Ellipsis Before the Last Pages */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last Page Links */}
        {totalPages > 2 && renderPageLink(totalPages - 1)}
        {totalPages > 3 && renderPageLink(totalPages)}

        {/* Next Button */}
        <PaginationItem>
          <Button
            aria-label="Go to next page"
            size="default"
            className={cn(
              "gap-1 pr-2.5",
              "hover:bg-primary hover:text-muted transition"
            )}
            asChild
            variant={"secondary"}
          >
            <Link
              href={pageHref(nextPage)}
              aria-disabled={currentPage >= totalPages}
              tabIndex={currentPage >= totalPages ? -1 : undefined}
              className={
                currentPage >= totalPages
                  ? " opacity-50 cursor-not-allowed"
                  : undefined
              }
            >
              {isMobile ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Link>
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
