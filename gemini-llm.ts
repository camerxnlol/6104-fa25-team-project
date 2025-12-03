/**
 * LLM Integration for DayPlanner
 *
 * Handles the requestAssignmentsFromLLM functionality using Google's Gemini API.
 * The LLM prompt is hardwired with user preferences and doesn't take external hints.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiLLM {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async executeLLM(prompt: string): Promise<string> {
    const llmPromise = (async () => {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Execute the LLM
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    })();

    try {
      return await llmPromise;
    } catch (error) {
      console.error("❌ Error calling Gemini API:", (error as Error).message);
      throw error;
    }
  }
}
