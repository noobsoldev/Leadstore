
export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  profileLink: string;
  rating: number | string;
  reviewCount: number | string;
}

export interface SearchParams {
  location: string;
  niche: string;
  limit: number;
}

export interface ScrapingProgress {
  status: 'idle' | 'searching' | 'parsing' | 'completed' | 'error';
  percentage: number;
  message: string;
}

export interface FilterState {
  minRating: number;
  minReviews: number;
}

export interface LocationSuggestion {
  name: string;
  description: string;
}
