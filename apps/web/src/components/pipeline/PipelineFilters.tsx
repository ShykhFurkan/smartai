"use client";

import * as React from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@smarthire/ui";

interface PipelineFiltersProps {
  onSearchChange: (val: string) => void;
  onJobChange: (val: string) => void;
  onTagChange: (val: string) => void;
  searchValue: string;
  jobValue: string;
  tagValue: string;
  jobs: { id: string; title: string }[];
  onClearFilters: () => void;
}

export function PipelineFilters({
  onSearchChange,
  onTagChange,
  searchValue,
  jobValue,
  tagValue,
  onClearFilters,
}: PipelineFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters = searchValue || jobValue || tagValue;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
        {/* Search */}
        <div className="relative flex-grow w-full">
          <input
            type="text"
            placeholder="Search candidate name, headline, email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-[12px] border border-[#D2D2D7] bg-white pl-10 pr-4 py-2.5 text-[13px] text-[#1D1D1F] placeholder-[#6E6E73] focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all duration-150"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6E6E73]" />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F2F2F2] w-full justify-center h-11 px-5 rounded-[12px] text-[13px] font-medium transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#6E6E73]" /> Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="border-[#D2D2D7] text-[#6E6E73] hover:bg-[#F2F2F2] flex items-center justify-center shrink-0 h-11 w-11 p-0 rounded-[12px] transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Drawer filter */}
      {showFilters && (
        <div className="sh-scale-in rounded-[16px] border border-[#D2D2D7] bg-white p-5 max-w-sm text-left shadow-sm">
          {/* Tag filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
              Filter by Candidate Tag
            </label>
            <input
              type="text"
              placeholder="e.g. React, senior"
              value={tagValue}
              onChange={(e) => onTagChange(e.target.value)}
              className="w-full rounded-[12px] border border-[#D2D2D7] bg-[#F5F5F7] px-3.5 py-2.5 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:border-[#0071E3] focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
