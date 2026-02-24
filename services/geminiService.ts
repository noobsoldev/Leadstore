
import { GoogleGenAI, Type } from "@google/genai";
import { Business, SearchParams, LocationSuggestion } from "../types";

// Reuse instance to improve performance and avoid potential initialization overhead
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Track last search completion to enforce a small cooldown between searches
let lastSearchEndTime = 0;

export class GeminiService {
  /**
   * Fetches location suggestions using Gemini's Google Maps grounding tool.
   */
  async suggestLocations(input: string): Promise<LocationSuggestion[]> {
    if (!input || input.trim().length < 2) return [];

    try {
      const modelName = 'gemini-3-flash-preview'; 
      const prompt = `Quickly list 5 real-world locations (City, State/Country) matching "${input}". Return as JSON array of {name, description}.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "City or location name" },
                description: { type: Type.STRING, description: "State, Country or region" }
              },
              required: ["name", "description"]
            }
          }
        },
      });

      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429) {
        console.warn("Location suggestion rate limited");
      }
      console.error("Location Suggestion Error:", error);
      return [];
    }
  }

  /**
   * Fetches niche/category suggestions.
   */
  async suggestNiches(input: string): Promise<string[]> {
    if (!input || input.trim().length < 2) return [];

    try {
      const modelName = 'gemini-3-flash-preview'; 
      const prompt = `Quickly list 5 business categories or niches matching "${input}". Return as a simple JSON string array.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
      });

      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429) {
        console.warn("Niche suggestion rate limited");
      }
      console.error("Niche Suggestion Error:", error);
      return [];
    }
  }

  /**
   * Fetches businesses using Gemini's Google Maps grounding tool.
   * Parallelizes batches to significantly improve speed.
   */
  async searchBusinesses(
    params: SearchParams, 
    onProgress: (p: number, msg: string) => void,
    onResults?: (results: Business[]) => void
  ): Promise<Business[]> {
    const { location, niche, limit } = params;
    
    // Enforce a minimum cooldown between searches to protect the free API quota
    const now = Date.now();
    const cooldownMs = 5000;
    if (now - lastSearchEndTime < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastSearchEndTime)) / 1000);
      onProgress(0, `To help the environment and keep this app free, please wait ${remaining} seconds before starting a new search.`);
      await new Promise(resolve => setTimeout(resolve, cooldownMs - (now - lastSearchEndTime)));
    }

    const BATCH_SIZE = 15; // Smaller batch size for faster individual responses
    const maxBatches = Math.ceil(limit / BATCH_SIZE);
    
    onProgress(5, `Starting real-time extraction for ${niche} in ${location}...`);

    const modelName = 'gemini-2.5-flash';
    const seenIds = new Set<string>();
    const allBusinesses: Business[] = [];

    const executeBatchWithRetry = async (batchIdx: number, retryCount = 0): Promise<Business[]> => {
      const currentBatchTarget = Math.min(BATCH_SIZE, limit - (batchIdx * BATCH_SIZE));
      if (currentBatchTarget <= 0) return [];

      try {
        const prompt = `
          DATA_EXTRACTION_MODE: ACTIVE
          TASK: Find and list ${currentBatchTarget} unique businesses.
          NICHE: "${niche}"
          LOCATION: "${location}"
          
          INSTRUCTIONS:
          - Be thorough. Search across the entire specified location.
          - Include all relevant businesses matching the niche.
          - Ensure data accuracy for phone numbers and addresses.
          
          OUTPUT_FIELDS:
          - name
          - address
          - phone
          - website
          - profileLink (Google Maps URL)
          - rating (number)
          - reviewCount (number)

          FORMAT: PURE_JSON_ARRAY
          NO_TEXT_OUTSIDE_JSON
        `;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            temperature: 0.1, // Even lower for maximum speed and precision
          },
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const rawResults = JSON.parse(jsonMatch[0]);
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
        }
        return [];
      } catch (error: any) {
        console.error(`Batch ${batchIdx} error:`, error);
        
        // Check for rate limit (429)
        if (error?.message?.includes('429') || error?.status === 429) {
          const waitSeconds = 10;
          onProgress(
            Math.round(10 + (completedBatches / maxBatches) * 85), 
            `To help the environment and keep this app free, we recommend you to wait for ${waitSeconds} seconds. Managing pause time...`
          );
          await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
          return executeBatchWithRetry(batchIdx, retryCount); // Retry without incrementing count for rate limits
        }

        if (retryCount < 1) { 
          await new Promise(resolve => setTimeout(resolve, 1000));
          return executeBatchWithRetry(batchIdx, retryCount + 1);
        }
        return [];
      }
    };

    try {
      // Execute batches in parallel with a slight delay to avoid burst limits
      const batchPromises = Array.from({ length: maxBatches }).map(async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 150)); // Slightly faster stagger
        const batchResults = await executeBatchWithRetry(i);
        return batchResults;
      });

      let completedBatches = 0;
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
