import { z } from "zod";

// Ollama API response schema
const OllamaResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  done: z.boolean(),
});

// Ollama API configuration
const OLLAMA_BASE_URL = "http://localhost:11434";

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = OLLAMA_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async generate(request: OllamaGenerateRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...request,
          stream: false, // We want a single response, not streaming
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as unknown;
      const parsed = OllamaResponseSchema.parse(data);

      return parsed.response;
    } catch (error) {
      console.error("Ollama API call failed:", error);
      throw new Error(
        `Failed to generate content with Ollama: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = (await response.json()) as {
        models?: Array<{ name: string }>;
      };
      return data.models?.map((model) => model.name) ?? [];
    } catch (error) {
      console.error("Failed to list models:", error);
      return [];
    }
  }
}

export const ollamaClient = new OllamaClient();

// Helper function to extract JSON from AI response
export function extractJSONFromResponse(response: string): unknown {
  try {
    // Try to find JSON in the response
    const jsonMatch = /\{[\s\S]*\}/.exec(response);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try to parse the entire response
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to extract JSON from response:", error);
    throw new Error("Invalid JSON response from AI");
  }
}

// Helper function to create a structured prompt for content generation
export function createContentGenerationPrompt(
  originalContent: string,
  context: {
    campaignName: string;
    targetAudience: string;
    restrictions?: string[];
    guidance?: string;
  }
): string {
  return `You are a marketing content specialist. Your task is to improve and personalize content for a specific campaign.

ORIGINAL CONTENT: "${originalContent}"

CAMPAIGN CONTEXT:
- Campaign: ${context.campaignName}
- Target Audience: ${context.targetAudience}
${context.restrictions ? `- Restrictions: ${context.restrictions.join(", ")}` : ""}
${context.guidance ? `- Guidance: ${context.guidance}` : ""}

TASK: Generate improved, personalized content that is more engaging and targeted to the specific audience and campaign goals.

RESPONSE FORMAT: You must respond with ONLY a valid JSON object in this exact format:
{
  "originalContent": "${originalContent}",
  "generatedContent": "your improved content here",
  "reasoning": "brief explanation of what changes you made and why",
  "confidence": 0.85,
  "alternatives": ["alternative version 1", "alternative version 2"]
}

Important: 
- Make the content more engaging and specific to the target audience
- Follow any restrictions provided
- Apply the guidance given
- Keep the same general meaning but improve tone, clarity, and appeal
- Provide exactly 2 alternative versions
- Respond with ONLY the JSON object, no other text`;
}
