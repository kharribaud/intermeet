"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

interface SearchFilterProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFiltersClick?: () => void;
}

export function SearchFilter({
  placeholder = "Rechercher par nom, spécialité...",
  onSearch,
  onFiltersClick,
}: SearchFilterProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(query);
    },
    [query, onSearch]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          aria-label="Recherche"
        />
      </div>
      <Button type="button" variant="outline" size="default" onClick={onFiltersClick}>
        <SlidersHorizontal className="size-4" />
        Filtres
      </Button>
    </form>
  );
}
