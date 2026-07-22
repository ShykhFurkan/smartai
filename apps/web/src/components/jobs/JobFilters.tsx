"use client";

import * as React from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@smarthire/ui";

interface JobFiltersProps {
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  searchValue: string;
  statusValue: string;
  locationValue: string;
  typeValue: string;
  onClearFilters: () => void;
}

export function JobFilters({
  onSearchChange,
  onStatusChange,
  onLocationChange,
  onTypeChange,
  searchValue,
  statusValue,
  locationValue,
  typeValue,
  onClearFilters,
}: JobFiltersProps) {
  const [showDrawer, setShowDrawer] = React.useState(false);

  const hasActiveFilters = searchValue || statusValue || locationValue || typeValue;

  return (
    <div className="space-y-4">
      {/* Top Search & Layout controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
        {/* Search Input */}
        <div className="relative flex-grow w-full">
          <input
            type="text"
            placeholder="Search jobs by title, department, category..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-[12px] border border-[#D2D2D7] bg-white pl-10 pr-4 py-2.5 text-[13px] text-[#1D1D1F] placeholder-[#6E6E73] focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all duration-150"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6E6E73]" />
        </div>

        {/* Filter Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-2 border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F2F2F2] w-full justify-center h-11 px-5 rounded-[12px] text-[13px] font-medium transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#6E6E73]" /> Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="border-[#D2D2D7] text-[#6E6E73] hover:bg-[#F2F2F2] flex items-center justify-center shrink-0 h-11 w-11 p-0 rounded-[12px] transition-colors"
              title="Clear Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showDrawer && (
        <div className="sh-scale-in rounded-[16px] border border-[#D2D2D7] bg-white p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left shadow-sm">
          {/* Status filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
              Job Status
            </label>
            <select
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-[12px] border border-[#D2D2D7] bg-[#F5F5F7] px-3.5 py-2.5 text-[13px] text-[#1D1D1F] focus:border-[#0071E3] focus:outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Location filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
              Location Filter
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, London"
              value={locationValue}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full rounded-[12px] border border-[#D2D2D7] bg-[#F5F5F7] px-3.5 py-2.5 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:border-[#0071E3] focus:outline-none transition-colors"
            />
          </div>

          {/* Employment Type filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
              Employment Type
            </label>
            <select
              value={typeValue}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full rounded-[12px] border border-[#D2D2D7] bg-[#F5F5F7] px-3.5 py-2.5 text-[13px] text-[#1D1D1F] focus:border-[#0071E3] focus:outline-none transition-colors"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
