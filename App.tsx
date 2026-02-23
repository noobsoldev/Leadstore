
import React, { useState, useMemo } from 'react';
import { Database, Search, ShieldCheck, AlertCircle, Info, RefreshCcw } from 'lucide-react';
import SearchForm from './components/SearchForm';
import BusinessTable from './components/BusinessTable';
import ExportActions from './components/ExportActions';
import FilterBar from './components/FilterBar';
import { Business, SearchParams, ScrapingProgress, FilterState } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    minRating: 0,
    minReviews: 0
  });
  const [progress, setProgress] = useState<ScrapingProgress>({
    status: 'idle',
    percentage: 0,
    message: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setError(null);
    setProgress({ status: 'searching', percentage: 0, message: 'Starting extraction...' });
    setBusinesses([]);
    setFilters({ minRating: 0, minReviews: 0 }); // Reset filters on new search

    try {
      const results = await geminiService.searchBusinesses(params, (p, msg) => {
        setProgress(prev => ({ ...prev, percentage: p, message: msg }));
      });
      
      setBusinesses(results);
      setProgress({ status: 'completed', percentage: 100, message: 'Extraction complete!' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during data extraction.');
      setProgress({ status: 'error', percentage: 0, message: 'Extraction failed.' });
    }
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(biz => {
      const rating = typeof biz.rating === 'number' ? biz.rating : parseFloat(biz.rating) || 0;
      const reviews = typeof biz.reviewCount === 'number' ? biz.reviewCount : parseInt(biz.reviewCount) || 0;
      
      return rating >= filters.minRating && reviews >= filters.minReviews;
    });
  }, [businesses, filters]);

  const removeBusiness = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  const reset = () => {
    setBusinesses([]);
    setFilters({ minRating: 0, minReviews: 0 });
    setProgress({ status: 'idle', percentage: 0, message: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Database size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LeadExtractor</h1>
              <p className="text-xs text-gray-500 font-medium">GMB Public Data Tool</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Public Data Compliant</span>
            </div>
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="no-print">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Local Business Leads</h2>
            <p className="text-gray-600">
              Enter a location and a business niche to scrape publicly visible details from Google Business Profiles.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={progress.status === 'searching'} />

          {/* Progress Bar */}
          {progress.status === 'searching' && (
            <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <RefreshCcw size={16} className="animate-spin" />
                  {progress.message}
                </span>
                <span className="text-sm font-bold text-blue-700">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <p className="mt-3 text-xs text-blue-600 flex items-center gap-1.5">
                <Info size={14} />
                This process involves grounding Gemini models against Google Maps live data.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-bold text-red-800">Extraction Error</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
                <button 
                  onClick={() => handleSearch({ location: 'Last Search', niche: 'Retrying', limit: 50 })}
                  className="mt-2 text-xs font-bold text-red-800 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {businesses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Extracted Records</h3>
                <button 
                  onClick={reset}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <FilterBar 
              filters={filters} 
              setFilters={setFilters} 
              resultsCount={filteredBusinesses.length} 
              totalCount={businesses.length} 
            />

            <ExportActions data={filteredBusinesses} />
            
            <div className="relative">
              <BusinessTable businesses={filteredBusinesses} onDelete={removeBusiness} />
              
              {filteredBusinesses.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 mt-4">
                  <p className="text-gray-500">No results match your current filters.</p>
                  <button 
                    onClick={() => setFilters({ minRating: 0, minReviews: 0 })}
                    className="text-blue-600 text-sm font-bold mt-2"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 text-center text-xs text-gray-400 border-t pt-4">
              Generated by LeadExtractor - Public Data Source: Google Maps
            </div>
          </div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && progress.status === 'idle' && (
          <div className="mt-12 text-center py-20 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 no-print">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No leads to show yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Start by searching for a niche and location above. Results will appear in a structured table here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} LeadExtractor. All data extracted is publicly available.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-widest font-bold">
                No-API-Key Required Tool
              </span>
              <div className="flex gap-4">
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
