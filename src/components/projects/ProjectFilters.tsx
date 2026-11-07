'use client';

import React from 'react';
import { Search, X, LayoutGrid, Table, RotateCcw } from 'lucide-react';
import { ProjectStatus } from '@/types';
import { Button } from '@/components/ui';

export interface ProjectFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  status: ProjectStatus | 'all';
  onStatusChange: (status: ProjectStatus | 'all') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  totalCount: number;
  filteredCount: number;
}

const statusOptions: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'On Track', value: 'on-track' },
  { label: 'Planning', value: 'planning' },
  { label: 'Completed', value: 'completed' },
  { label: 'Blocked', value: 'blocked' },
];

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = search.trim().length > 0 || status !== 'all';

  const handleReset = () => {
    onSearchChange('');
    onStatusChange('all');
  };

  return (
    <div className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by name, slug or lead..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200/90 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Toggle & Reset */}
        <div className="flex items-center gap-2 justify-between md:justify-end flex-wrap">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-slate-500 hover:text-slate-800"
            >
              Reset Filters
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              aria-label="Card view"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-label="Table view"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0 mr-1">Status:</span>
        {statusOptions.map((opt) => {
          const isSelected = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#5851d8] text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200/70'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <span className="ml-auto text-xs text-slate-400 shrink-0 pl-2">
          Showing <span className="font-semibold text-slate-700">{filteredCount}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalCount}</span>
        </span>
      </div>
    </div>
  );
};

