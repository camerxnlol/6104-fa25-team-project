/**
 * LLM Integration for Database
 *
 * Handles the generateSentences functionality using Google's Gemini API.
 * The LLM prompt is hardwired with user preferences and doesn't take external hints.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Configuration for API access
 */
export interface Config {
  apiKey: string;
}

export class GeminiLLM {
  private apiKey: string;
  private temperature: number;

  constructor(vocabSize?: number) {
    const envKey = Deno.env.get("GEMINI_API_KEY");
    if (!envKey) {
      throw new Error(
        "GEMINI_API_KEY not set in environment. Please add it before starting the server.",
      );
    }
    this.apiKey = envKey;
    this.temperature = this.computeTemperature(vocabSize ?? 0);

    // Debug: Log only the last few characters of the API key for diagnostics.
    // Avoid printing the full key. If key is very short, ensure at least one char remains hidden.
    try {
      const keyLen = this.apiKey?.length ?? 0;
      const revealCount = keyLen > 5 ? 5 : Math.max(1, keyLen - 1);
      const suffix = keyLen > 0 ? this.apiKey.slice(-revealCount) : "";
      console.log(
        `GeminiLLM: API key ends with: ${suffix} (showing last ${revealCount})`,
      );
    } catch {
      // no-op: never let logging interfere with construction
    }
  }

  private computeTemperature(vocabSize: number): number {
    if (vocabSize <= 10) return 0.9;
    if (vocabSize <= 20) return 0.6;
    if (vocabSize <= 50) return 0.3;
    return 0.1;
  }

  async executeLLM(prompt: string): Promise<string> {
    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: this.temperature,
          responseMimeType: "application/json",
        },
      });
      // Execute the LLM
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error("❌ Error calling Gemini API:", (error as Error).message);
      throw error;
    }
  }
}
