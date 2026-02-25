import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/suggestions/locations", async (req, res) => {
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
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Location Suggestion Error:", error);
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions/niches", async (req, res) => {
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
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Niche Suggestion Error:", error);
      res.status(500).json({ error: "Failed to fetch niche suggestions" });
    }
  });

  app.post("/api/search", async (req, res) => {
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
        res.json(JSON.parse(jsonMatch[0]));
      } else {
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
