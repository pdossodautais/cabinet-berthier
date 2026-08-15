"use client";

import { Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/pagination";

export function Pagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  }

  // Au lieu d'un <a href> natif qui recharge la page entière et remonte en
  // haut, on intercepte le clic pour faire un router.push avec scroll:false.
  // Le composant parent (BiensControlsBar) s'occupe ensuite de ramener
  // l'utilisateur à la hauteur de la controls bar.
  function handleClick(page: number) {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Laisse passer Cmd/Ctrl+clic, clic molette, etc. (ouverture en onglet)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      router.push(getPageUrl(page), { scroll: false });
    };
  }

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    }
  }

  return (
    <PaginationRoot className="mt-8" aria-label="Pagination">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href={getPageUrl(currentPage - 1)}
              onClick={handleClick(currentPage - 1)}
              text="Précédent"
              aria-label="Précédent"
            />
          </PaginationItem>
        )}
        {pages.map((page, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev && page - prev > 1;
          return (
            <Fragment key={page}>
              {showEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis aria-label="Pages supplémentaires" />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href={getPageUrl(page)}
                  onClick={handleClick(page)}
                  isActive={page === currentPage}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          );
        })}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href={getPageUrl(currentPage + 1)}
              onClick={handleClick(currentPage + 1)}
              text="Suivant"
              aria-label="Suivant"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  );
}
