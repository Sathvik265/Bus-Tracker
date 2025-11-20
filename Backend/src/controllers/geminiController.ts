import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
//import { Trip } from "../models/Trip"; // Assuming Trip model can be imported as a type
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types";

// Initialize the Google AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateContent = async (
  req: AuthRequest,
  res: Response<ApiResponse<string>>
): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, error: "Prompt is required" });
      return;
    }

    // Updated to use the newer 'gemini-1.5-flash' model which is good with JSON
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const fullPrompt = `
      Generate a realistic, but fictional, bus trip based on the following request: "${prompt}".
      The trip must start today or in the near future.
      The response must be a single JSON object that strictly follows this TypeScript interface:
      
      interface Trip {
        route: {
          origin: { name: string };
          destination: { name: string };
        };
        bus: {
          operator: string;
          type: 'Non-AC Seater' | 'AC Sleeper' | 'Volvo Multi-Axle';
        };
        startTime: string; // ISO 8601 format
        endTime: string; // ISO 8601 format
        fare: number;
        status: 'scheduled';
      }

      Do not include any other text, explanations, or markdown formatting. Only the JSON object.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const generatedTrip = JSON.parse(text);

    res.status(200).json({ success: true, data: generatedTrip });
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate content" });
  }
};
