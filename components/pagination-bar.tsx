import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQueryState } from "nuqs";
import { Button } from "./ui/button";

interface PaginationBarProps {
  limit: number;
  totalPages: number;
}

export const PaginationBar = ({ limit, totalPages }: PaginationBarProps) => {
  const [page, setPage] = useQueryState("page", { defaultValue: "1" });

  const currentPage = parseInt(page);

  const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
  const prevPage = currentPage > 1 ? currentPage - 1 : 1;

  const pageHref = (pageNum: number) =>
    `http://localhost:3000/?page=${pageNum}&limit=${limit}`;

  const renderPageLink = (pageNum: number) => (
    <PaginationItem
      key={pageNum}
      className={`border rounded-md ${
        currentPage === pageNum ? "bg-primary text-primary-foreground" : ""
      }`}
    >
      <PaginationLink href={pageHref(pageNum)}>{pageNum}</PaginationLink>
    </PaginationItem>
  );

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem className="border rounded-md">
          <Button disabled={currentPage === 1} asChild variant={"outline"}>
            <PaginationPrevious href={pageHref(prevPage)} />
          </Button>
        </PaginationItem>

        {/* First btn */}
        {renderPageLink(1)}

        {/* second btn */}
        {totalPages > 1 && renderPageLink(2)}

        {/* Ellipsis and Active Page in the Middle */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Active Page in the middle if not in the first or last two */}
        {currentPage > 2 &&
          currentPage < totalPages - 1 &&
          renderPageLink(currentPage)}

        {/* Ellipsis before the last two pages if active page isn't one of them */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last two pages */}
        {totalPages > 2 && renderPageLink(totalPages - 1)}

        {totalPages > 3 && renderPageLink(totalPages)}

        {/* Next Button */}
        <PaginationItem className="border rounded-md">
          <Button
            asChild
            variant={"outline"}
            disabled={currentPage === totalPages}
          >
            <PaginationNext href={pageHref(nextPage)} />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
