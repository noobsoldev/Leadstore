
import React, { useState, useMemo } from 'react';
import { Target, Search, ShieldCheck, AlertCircle, Info, RefreshCcw, X, User, Mail, Smartphone, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import SearchForm from './components/SearchForm';
import BusinessTable from './components/BusinessTable';
import ExportActions from './components/ExportActions';
import FilterBar from './components/FilterBar';
import { Business, SearchParams, ScrapingProgress, FilterState } from './types';
import { geminiService } from './services/geminiService';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', mobile: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormState({ name: '', email: '', mobile: '' });
      setActiveModal(null);
    }, 3000);
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
    <AnimatePresence mode="wait">
      {!showApp ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onStart={() => setShowApp(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col"
        >
          {/* Header */}
          <header className="bg-white border-b border-gray-100 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setShowApp(false)}
                role="button"
                aria-label="Go back to landing page"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Target size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Leadstore.online</h1>
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
                  aria-label="Powered by Gemini - Open AI Google Dev"
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
                      aria-label="Retry extraction"
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
                      aria-label="Clear all extracted leads"
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
                        aria-label="Clear all filters"
                        className="text-blue-600 text-sm font-bold mt-2"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-center text-xs text-gray-400 border-t pt-4">
                  Generated by Leadstore.online - Public Data Source: Google Maps
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
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Leadstore.online. All data extracted is publicly available.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-widest font-bold">
                    No-API-Key Required Tool
                  </span>
                  <div className="flex gap-4">
                    <button onClick={() => setShowApp(false)} className="text-sm text-gray-400 hover:text-gray-600">About</button>
                    <button onClick={() => setActiveModal('privacy')} className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</button>
                    <button onClick={() => setActiveModal('terms')} className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</button>
                    <button onClick={() => setActiveModal('contact')} className="text-sm text-gray-400 hover:text-gray-600">Contact</button>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          {/* Modals */}
          <AnimatePresence>
            {activeModal === 'privacy' && (
              <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Privacy Policy">
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="mb-4">At Leadstore.online, we value your privacy. This policy explains how we handle data.</p>
                  <h4 className="font-bold text-gray-900 mb-2">1. Data Collection</h4>
                  <p className="mb-4">We do not store any business data you scrape. All extraction happens in real-time and results are handled locally in your browser.</p>
                  <h4 className="font-bold text-gray-900 mb-2">2. Usage</h4>
                  <p className="mb-4">The tool is intended for finding publicly available business information. Users are responsible for complying with local regulations regarding outreach.</p>
                  <h4 className="font-bold text-gray-900 mb-2">3. Cookies</h4>
                  <p className="mb-4">We use minimal cookies for essential site functionality and analytics to improve our service.</p>
                </div>
              </Modal>
            )}

            {activeModal === 'terms' && (
              <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Terms of Service">
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="mb-4">By using Leadstore.online, you agree to the following terms:</p>
                  <h4 className="font-bold text-gray-900 mb-2">1. Acceptable Use</h4>
                  <p className="mb-4">You agree not to use this tool for any illegal activities or to violate the terms of service of third-party data providers.</p>
                  <h4 className="font-bold text-gray-900 mb-2">2. No Warranty</h4>
                  <p className="mb-4">The tool is provided "as is" without any warranties. We are not responsible for the accuracy of the data extracted.</p>
                  <h4 className="font-bold text-gray-900 mb-2">3. Limitation of Liability</h4>
                  <p className="mb-4">Leadstore.online and Noob{'{'}Dev{'}'} Technologies shall not be liable for any damages arising from the use of this tool.</p>
                </div>
              </Modal>
            )}

            {activeModal === 'contact' && (
              <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Contact Us">
                <div className="bg-white rounded-3xl p-2 text-gray-900">
                  <p className="text-gray-600 mb-6">Have questions or need a custom solution? Send us a message and our team will get back to you.</p>
                  {isSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                      <p className="text-gray-500">We'll get back to you shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="app-modal-name" className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            id="app-modal-name"
                            required
                            type="text" 
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            value={formState.name}
                            onChange={e => setFormState({...formState, name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="app-modal-email" className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            id="app-modal-email"
                            required
                            type="email" 
                            placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            value={formState.email}
                            onChange={e => setFormState({...formState, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="app-modal-mobile" className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            id="app-modal-mobile"
                            required
                            type="tel" 
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            value={formState.mobile}
                            onChange={e => setFormState({...formState, mobile: e.target.value})}
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        aria-label="Submit contact form"
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95 mt-4"
                      >
                        Send Message
                        <Send size={18} />
                      </button>
                    </form>
                  )}
                  <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">Powered By</p>
                    <a href="https://noobdev.tech/" target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:underline">
                      Noob<span className="text-[#990000]">{'{'}</span>Dev<span className="text-[#990000] font-bold">{'}'}</span> Technologies
                    </a>
                  </div>
                </div>
              </Modal>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
