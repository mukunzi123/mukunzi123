
import { GoogleGenAI, Type } from "@google/genai";

// Helper for exponential backoff retries
const withRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isRetryable = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('UNKNOWN') || errorMsg.includes('xhr') || errorMsg.includes('ProxyUnaryCall');
      
      if (isRetryable && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
};

export const geminiService = {
  enhanceMovieDetails: async (title: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate high-fidelity movie metadata for a movie titled: "${title}". 
        Provide a realistic YouTube embed URL for an official trailer or high-quality movie clip (use format: https://www.youtube.com/embed/VIDEO_ID). 
        Include:
        - description (engaging and cinematic)
        - category (Action, Adventure, Sci-Fi, Horror, Comedy, Drama, Thriller, Animation, Fantasy)
        - year (accurate release year)
        - fileSize (estimate, e.g., 2.4 GB)
        - quality (4K, Full HD, or HD)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              year: { type: Type.INTEGER },
              fileSize: { type: Type.STRING },
              quality: { type: Type.STRING },
              trailerUrl: { type: Type.STRING, description: "Official YouTube embed URL" }
            },
            required: ["description", "category", "year", "fileSize", "trailerUrl"]
          }
        }
      }));
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini Enhancement Error:", error);
      return null;
    }
  },

  findLegalSources: async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find legitimate streaming links and information for the movie or video: "${query}". Search specifically for links from YouTube, Netflix, Disney+, Amazon Prime, or Internet Archive if public domain. Focus on providing direct URLs where possible.`;

    try {
      const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        },
      }));

      const text = response.text;
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      return {
        recommendation: text,
        sources: grounding.map((chunk: any) => ({
          title: chunk.web?.title || 'External Intelligence Node',
          uri: chunk.web?.uri || '#'
        })).filter((s: any) => s.uri !== '#')
      };
    } catch (error) {
      console.warn("Search grounding failed, using fallback knowledge", error);
      try {
        const fallback = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt + " Answer using internal knowledge only."
        });
        return { recommendation: fallback.text, sources: [] };
      } catch {
        return null;
      }
    }
  },

  getLegalPlatformsDirectory: async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = "List official legal streaming platforms available globally and in Africa (Showmax, Netflix, Apple TV, Disney+). Include high-quality public domain sites like Internet Archive for legal free content.";

    try {
      const response = await withRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      }));
      
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return {
        text: response.text,
        links: grounding.map((chunk: any) => ({
          title: chunk.web?.title || 'Platform Node',
          uri: chunk.web?.uri || '#'
        })).filter((s: any) => s.uri !== '#')
      };
    } catch (error) {
      console.warn("Directory search failed", error);
      return { text: "Search currently limited. Please check major providers like Netflix and Showmax.", links: [] };
    }
  }
};
