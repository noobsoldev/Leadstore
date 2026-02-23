
import React from 'react';
import { Filter, Star, MessageSquare, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resultsCount: number;
  totalCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, resultsCount, totalCount }) => {
  const hasFilters = filters.minRating > 0 || filters.minReviews > 0;

  const resetFilters = () => {
    setFilters({ minRating: 0, minReviews: 0 });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6 no-print">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 shrink-0">
        <Filter size={16} className="text-blue-600" />
        Advanced Filters
      </div>

      <div className="flex flex-wrap items-center gap-4 flex-grow">
        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min Rating</label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
            <select
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
            >
              <option value={0}>Any</option>
              <option value={3}>3.0+</option>
              <option value={3.5}>3.5+</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>
        </div>

        {/* Reviews Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min Reviews</label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            <MessageSquare size={14} className="text-blue-400 mr-1" />
            <input
              type="number"
              min="0"
              step="10"
              className="bg-transparent text-sm font-medium text-gray-700 outline-none w-16"
              value={filters.minReviews}
              onChange={(e) => setFilters({ ...filters, minReviews: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="shrink-0 text-sm font-medium text-gray-500">
        Showing <span className="text-blue-600">{resultsCount}</span> of <span className="text-gray-900">{totalCount}</span>
      </div>
    </div>
  );
};

export default FilterBar;
