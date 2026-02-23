
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const BATCH_SIZE = 25; 
    const maxBatches = Math.ceil(limit / BATCH_SIZE);
    
    onProgress(5, `Initializing parallel extraction for ${niche} in ${location}...`);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash';

    // Create batch tasks
    const batchPromises = Array.from({ length: maxBatches }).map(async (_, i) => {
      const currentBatchTarget = Math.min(BATCH_SIZE, limit - (i * BATCH_SIZE));
      if (currentBatchTarget <= 0) return [];

      try {
        // We add a slight variation to the prompt for each batch to encourage the model 
        // to explore different parts of the search space since we can't do sequential deduplication easily in parallel.
        const variations = [
          "Focus on the most popular results.",
          "Include some highly-rated but potentially less known results.",
          "Look for results in different neighborhoods or areas.",
          "Ensure a wide variety of results are captured.",
          "Prioritize results with complete contact information."
        ];
        const variation = variations[i % variations.length];

        const prompt = `
          Search for and list at least ${currentBatchTarget} unique publicly listed businesses for the niche "${niche}" in "${location}". 
          ${variation}
          
          For each business, extract:
          - Business Name
          - Full Address
          - Phone Number
          - Website URL
          - Google Maps/GMB Profile Link
          - Rating (number)
          - Number of Reviews (number)

          FORMAT RESPONSE AS A VALID JSON ARRAY OF OBJECTS with keys: "name", "address", "phone", "website", "profileLink", "rating", "reviewCount".
          Return ONLY the JSON array.
        `;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            temperature: 0.8, // Slightly higher to encourage diversity across parallel calls
          },
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return [];
      } catch (error) {
        console.error(`Error in parallel batch ${i}:`, error);
        return [];
      }
    });

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
