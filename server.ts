import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get and trim API key
const getApiKey = () => {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) {
    console.error("CRITICAL: GEMINI_API_KEY is not set or is empty.");
  } else if (!key.startsWith("AIza")) {
    console.warn("WARNING: GEMINI_API_KEY does not start with 'AIza'. It might be invalid.");
  }
  return key;
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({ 
      status: hasKey ? "ok" : "error", 
      message: hasKey ? "Server is ready" : "GEMINI_API_KEY is missing in server environment." 
    });
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

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
