
import { GoogleGenAI } from "@google/genai";
import { Business, SearchParams, LocationSuggestion } from "../types";

export class GeminiService {
  /**
   * Fetches location suggestions using Gemini's Google Maps grounding tool.
   */
  async suggestLocations(input: string): Promise<LocationSuggestion[]> {
    // Allow suggestions for even single character inputs to improve responsiveness
    if (!input || input.trim().length === 0) return [];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const modelName = 'gemini-2.5-flash';
      const prompt = `
        Based on the input "${input}", suggest up to 5 real-world locations (cities, neighborhoods, or regions).
        Even if the input is short, provide the most likely intended locations.
        Format your response strictly as a JSON array of objects with keys "name" and "description".
        Only return the JSON.
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Location Suggestion Error:", error);
      return [];
    }
  }

  /**
   * Fetches businesses using Gemini's Google Maps grounding tool.
   * Parallelizes batches to significantly improve speed.
   */
  async searchBusinesses(
    params: SearchParams, 
    onProgress: (p: number, msg: string) => void
  ): Promise<Business[]> {
    const { location, niche, limit } = params;
    const BATCH_SIZE = 50; // Increased batch size for faster extraction
    const maxBatches = Math.ceil(limit / BATCH_SIZE);
    
    onProgress(5, `Initializing high-speed extraction for ${niche} in ${location}...`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = 'gemini-2.5-flash';

    const executeBatchWithRetry = async (batchIdx: number, retryCount = 0): Promise<any[]> => {
      const currentBatchTarget = Math.min(BATCH_SIZE, limit - (batchIdx * BATCH_SIZE));
      if (currentBatchTarget <= 0) return [];

      // Removed staggering for maximum speed
      try {
        const variations = [
          "Focus on the most prominent and high-rated businesses.",
          "Include a diverse range of businesses across the area.",
          "Ensure all contact details are accurately captured.",
          "Look for businesses with the most recent reviews.",
          "Prioritize businesses with verified profiles."
        ];
        const variation = variations[batchIdx % variations.length];

        const prompt = `
          ACT AS A DATA EXTRACTION EXPERT.
          TASK: Find and list ${currentBatchTarget} unique businesses for "${niche}" in "${location}".
          ${variation}
          
          REQUIRED FIELDS FOR EACH:
          - name: Business Name
          - address: Full Physical Address
          - phone: Phone Number (formatted)
          - website: Official Website URL
          - profileLink: Google Maps/GMB Profile URL
          - rating: Numerical Rating (e.g. 4.5)
          - reviewCount: Total Number of Reviews

          RESPONSE FORMAT: A PURE JSON ARRAY OF OBJECTS.
          NO PREAMBLE. NO MARKDOWN BLOCKS. JUST THE JSON.
        `;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            temperature: 0.4, // Lower temperature for more consistent JSON
          },
        });

        const text = response.text || "";
        // Try to find JSON even if model adds text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error("JSON Parse Error in batch:", e);
            return [];
          }
        }
        return [];
      } catch (error: any) {
        console.error(`Error in batch ${batchIdx} (Attempt ${retryCount + 1}):`, error);
        
        if (retryCount < 2) {
          const delay = 1000; // Faster retry
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeBatchWithRetry(batchIdx, retryCount + 1);
        }
        return [];
      }
    };

    // Create batch tasks
    const batchPromises = Array.from({ length: maxBatches }).map((_, i) => executeBatchWithRetry(i));

    // Monitor progress of parallel batches
    let completedBatches = 0;
    const results = await Promise.all(batchPromises.map(p => p.then(res => {
      completedBatches++;
      const progress = 10 + (completedBatches / maxBatches) * 85;
      onProgress(Math.round(progress), `Extracted batch ${completedBatches} of ${maxBatches}...`);
      return res;
    })));

    // Flatten and deduplicate
    const allBusinesses: Business[] = [];
    const seenIds = new Set<string>();

    results.flat().forEach((item: any, idx: number) => {
      if (!item || !item.name) return;

      // Simple deduplication key
      const uniqueKey = `${item.name}-${item.phone || item.address}`.toLowerCase();
      
      if (!seenIds.has(uniqueKey) && allBusinesses.length < limit) {
        seenIds.add(uniqueKey);
        allBusinesses.push({
          id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name || "N/A",
          address: item.address || "N/A",
          phone: item.phone || "N/A",
          website: item.website || "N/A",
          profileLink: item.profileLink || "N/A",
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
        });
      }
    });

    onProgress(100, `Successfully extracted ${allBusinesses.length} unique leads.`);
    return allBusinesses;
  }
}

export const geminiService = new GeminiService();
