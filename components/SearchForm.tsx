
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Briefcase, ChevronDown, Navigation, Loader2, X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchParams, LocationSuggestion } from '../types';
import { geminiService } from '../services/geminiService';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [params, setParams] = useState<SearchParams>({
    location: '',
    niche: '',
    limit: 50
  });

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [nicheSuggestions, setNicheSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestingNiche, setIsSuggestingNiche] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNicheSuggestions, setShowNicheSuggestions] = useState(false);
  const [isListening, setIsListening] = useState<'niche' | 'location' | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const nicheRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicheDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (isListening === 'niche') {
          handleNicheChange(transcript);
        } else if (isListening === 'location') {
          handleLocationChange(transcript);
        }
        setIsListening(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(null);
      };

      recognitionRef.current.onend = () => {
        setIsListening(null);
      };
    }
  }, [isListening]);

  const toggleListening = (field: 'niche' | 'location') => {
    if (isListening === field) {
      recognitionRef.current?.stop();
      setIsListening(null);
    } else {
      setIsListening(field);
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (nicheRef.current && !nicheRef.current.contains(event.target as Node)) {
        setShowNicheSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSuggestions = async (val: string) => {
    if (val.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSuggesting(true);
    try {
      const results = await geminiService.suggestLocations(val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSuggesting(false);
    }
  };

  const triggerNicheSuggestions = async (val: string) => {
    if (val.trim().length === 0) {
      setNicheSuggestions([]);
      setShowNicheSuggestions(false);
      return;
    }

    setIsSuggestingNiche(true);
    try {
      const results = await geminiService.suggestNiches(val);
      setNicheSuggestions(results);
      setShowNicheSuggestions(results.length > 0);
    } catch (error) {
      console.error("Niche suggestion error:", error);
      setNicheSuggestions([]);
      setShowNicheSuggestions(false);
    } finally {
      setIsSuggestingNiche(false);
    }
  };

  const handleLocationChange = (val: string) => {
    setParams({ ...params, location: val });
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.length > 1) {
      debounceTimer.current = setTimeout(() => {
        triggerSuggestions(val);
      }, 200); // Even faster debounce for "instant" feel
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleNicheChange = (val: string) => {
    setParams({ ...params, niche: val });
    
    if (nicheDebounceTimer.current) clearTimeout(nicheDebounceTimer.current);

    if (val.length > 1) {
      nicheDebounceTimer.current = setTimeout(() => {
        triggerNicheSuggestions(val);
      }, 200);
    } else {
      setNicheSuggestions([]);
      setShowNicheSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (params.location.length > 0) {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      } else {
        triggerSuggestions(params.location);
      }
    }
  };

  const handleNicheFocus = () => {
    if (params.niche.length > 0) {
      if (nicheSuggestions.length > 0) {
        setShowNicheSuggestions(true);
      } else {
        triggerNicheSuggestions(params.niche);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setParams({ ...params, location: "Locating..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setParams({ ...params, location: locStr });
          setShowSuggestions(false);
          triggerSuggestions(locStr);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setParams({ ...params, location: "" });
          alert("Could not access your location. Please type manually.");
        }
      );
    }
  };

  const selectSuggestion = (s: LocationSuggestion) => {
    setParams({ ...params, location: s.name });
    setShowSuggestions(false);
  };

  const selectNicheSuggestion = (s: string) => {
    setParams({ ...params, niche: s });
    setShowNicheSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.location || !params.niche) return;
    onSearch(params);
    setShowSuggestions(false);
    setShowNicheSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 relative z-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1 relative" ref={nicheRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-500" />
            Niche / Keyword
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Dentist, Gym, Cafe"
              className="w-full bg-white text-gray-900 px-4 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={params.niche}
              onChange={(e) => handleNicheChange(e.target.value)}
              onFocus={handleNicheFocus}
              autoComplete="off"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleListening('niche')}
                className={`p-1.5 rounded-full transition-colors ${
                  isListening === 'niche' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="Voice Input"
              >
                {isListening === 'niche' ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <AnimatePresence>
                {isSuggestingNiche && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Niche Suggestions Dropdown */}
          {showNicheSuggestions && nicheSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
              {nicheSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectNicheSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex flex-col"
                >
                  <span className="text-sm font-bold text-gray-900">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1 relative" ref={suggestionRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-red-500" />
              Location
            </span>
            <button 
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold uppercase"
            >
              <Navigation size={10} />
              Current
            </button>
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="e.g. London, NYC"
              className="w-full bg-white text-gray-900 px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={params.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={handleFocus}
              autoComplete="off"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleListening('location')}
                className={`p-1.5 rounded-full transition-colors ${
                  isListening === 'location' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="Voice Input"
              >
                {isListening === 'location' ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              {params.location && (
                <button 
                  type="button"
                  onClick={() => handleLocationChange('')}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <AnimatePresence>
                {isSuggesting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[60]">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex flex-col"
                >
                  <span className="text-sm font-bold text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Results
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
              value={params.limit}
              onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) })}
            >
              <option value={20}>20 (Fastest)</option>
              <option value={50}>50 (Standard)</option>
              <option value={100}>100 (Deep Search)</option>
              <option value={200}>200 (Bulk)</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Search size={18} />
              Extract Leads
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
