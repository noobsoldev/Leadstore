
import { Business, SearchParams, LocationSuggestion } from "../types";

// Track last search completion to enforce a small cooldown between searches
let lastSearchEndTime = 0;

export class GeminiService {
  /**
   * Fetches location suggestions using backend API.
   */
  async suggestLocations(input: string): Promise<LocationSuggestion[]> {
    if (!input || input.trim().length < 2) return [];

    try {
      const response = await fetch("/api/suggestions/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) throw new Error("Failed to fetch suggestions");
      return await response.json();
    } catch (error: any) {
      console.error("Location Suggestion Error:", error);
      return [];
    }
  }

  /**
   * Fetches niche/category suggestions using backend API.
   */
  async suggestNiches(input: string): Promise<string[]> {
    if (!input || input.trim().length < 2) return [];

    try {
      const response = await fetch("/api/suggestions/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) throw new Error("Failed to fetch niche suggestions");
      return await response.json();
    } catch (error: any) {
      console.error("Niche Suggestion Error:", error);
      return [];
    }
  }

  /**
   * Fetches businesses using backend API.
   * Parallelizes batches to significantly improve speed.
   */
  async searchBusinesses(
    params: SearchParams, 
    onProgress: (p: number, msg: string) => void,
    onResults?: (results: Business[]) => void
  ): Promise<Business[]> {
    const { limit } = params;
    
    // Enforce a minimum cooldown between searches to protect the free API quota
    const now = Date.now();
    const cooldownMs = 5000;
    if (now - lastSearchEndTime < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastSearchEndTime)) / 1000);
      onProgress(0, `To help the environment and keep this app free, please wait ${remaining} seconds before starting a new search.`);
      await new Promise(resolve => setTimeout(resolve, cooldownMs - (now - lastSearchEndTime)));
    }

    const BATCH_SIZE = 15; 
    const maxBatches = Math.ceil(limit / BATCH_SIZE);
    
    onProgress(5, `Starting real-time extraction...`);

    const seenIds = new Set<string>();
    const allBusinesses: Business[] = [];

    const executeBatchWithRetry = async (batchIdx: number, retryCount = 0): Promise<Business[]> => {
      const currentBatchTarget = Math.min(BATCH_SIZE, limit - (batchIdx * BATCH_SIZE));
      if (currentBatchTarget <= 0) return [];

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params, batchIdx, currentBatchTarget }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { status: response.status, message: errorData.error || "Search failed" };
        }

        const rawResults = await response.json();
        const processedResults: Business[] = [];

        rawResults.forEach((item: any, idx: number) => {
          if (!item || !item.name) return;
          const uniqueKey = `${item.name}-${item.phone || item.address}`.toLowerCase();
          
          if (!seenIds.has(uniqueKey)) {
            seenIds.add(uniqueKey);
            const business: Business = {
              id: `${Date.now()}-${batchIdx}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              name: item.name || "N/A",
              address: item.address || "N/A",
              phone: item.phone || "N/A",
              website: item.website || "N/A",
              profileLink: item.profileLink || "N/A",
              rating: item.rating || 0,
              reviewCount: item.reviewCount || 0,
            };
            processedResults.push(business);
          }
        });

        if (onResults && processedResults.length > 0) {
          onResults(processedResults);
        }
        return processedResults;
      } catch (error: any) {
        console.error(`Batch ${batchIdx} error:`, error);
        
        // Check for rate limit (429)
        if (error?.status === 429 || error?.message?.includes('429')) {
          const waitSeconds = 10;
          onProgress(
            Math.round(10 + (completedBatches / maxBatches) * 85), 
            `To help the environment and keep this app free, we recommend you to wait for ${waitSeconds} seconds. Managing pause time...`
          );
          await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
          return executeBatchWithRetry(batchIdx, retryCount); 
        }

        if (retryCount < 1) { 
          await new Promise(resolve => setTimeout(resolve, 1000));
          return executeBatchWithRetry(batchIdx, retryCount + 1);
        }
        return [];
      }
    };

    let completedBatches = 0;
    try {
      // Execute batches in parallel with a slight delay to avoid burst limits
      const batchPromises = Array.from({ length: maxBatches }).map(async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 150)); 
        const batchResults = await executeBatchWithRetry(i);
        return batchResults;
      });

      const results = await Promise.all(batchPromises.map(p => p.then(res => {
        completedBatches++;
        const progress = 10 + (completedBatches / maxBatches) * 85;
        onProgress(Math.round(progress), `Extracted ${seenIds.size} leads so far...`);
        return res;
      })));

      results.flat().forEach(b => {
        if (allBusinesses.length < limit) {
          allBusinesses.push(b);
        }
      });

      onProgress(100, `Extraction complete. Found ${allBusinesses.length} unique leads.`);
      return allBusinesses;
    } finally {
      lastSearchEndTime = Date.now();
    }
  }
}

export const geminiService = new GeminiService();
