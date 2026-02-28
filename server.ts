import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper to check API key
const checkApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables.");
    return false;
  }
  return true;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({ 
      status: hasKey ? "ok" : "error", 
      message: hasKey ? "Server is ready" : "GEMINI_API_KEY is missing in server environment." 
    });
  });

  app.post("/api/suggestions/locations", async (req, res) => {
    if (!checkApiKey()) return res.status(500).json({ error: "API Key missing" });
    const { input } = req.body;
    if (!input || input.trim().length < 2) return res.json([]);

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
      try {
        res.json(JSON.parse(text));
      } catch (e) {
        console.error("JSON Parse Error (Locations):", text);
        res.json([]);
      }
    } catch (error: any) {
      console.error("Location Suggestion Error:", error);
      const status = error?.status || 500;
      res.status(status).json({ error: error.message || "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions/niches", async (req, res) => {
    if (!checkApiKey()) return res.status(500).json({ error: "API Key missing" });
    const { input } = req.body;
    if (!input || input.trim().length < 2) return res.json([]);

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
      try {
        res.json(JSON.parse(text));
      } catch (e) {
        console.error("JSON Parse Error (Niches):", text);
        res.json([]);
      }
    } catch (error: any) {
      console.error("Niche Suggestion Error:", error);
      const status = error?.status || 500;
      res.status(status).json({ error: error.message || "Failed to fetch niche suggestions" });
    }
  });

  app.post("/api/search", async (req, res) => {
    if (!checkApiKey()) return res.status(500).json({ error: "API Key missing" });
    const { params, batchIdx, currentBatchTarget } = req.body;
    const { location, niche } = params;

    try {
      const modelName = 'gemini-2.5-flash';
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
          temperature: 0.1,
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`Search success: Found ${parsed.length} items in batch ${batchIdx}`);
        res.json(parsed);
      } else {
        console.warn(`Search warning: No JSON found in response text for batch ${batchIdx}`);
        res.json([]);
      }
    } catch (error: any) {
      console.error(`Search error:`, error);
      const status = error?.status || 500;
      res.status(status).json({ error: error.message || "Search failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
