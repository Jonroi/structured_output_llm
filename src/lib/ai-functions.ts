import type { z } from "zod";
import {
  AIContentGenerationSchema,
  AIIPCSchema,
  CampaignPersonalizationSchema,
  type AIContentGeneration,
  type AIIPC,
  type CampaignPersonalization,
} from "~/lib/types/ai-output";
import {
  ollamaClient,
  extractJSONFromResponse,
  createContentGenerationPrompt,
} from "~/lib/ollama-client";

// AI Content Generation Function
export async function aiGeneratePageContent(
  originalContent: string,
  context: {
    campaignName: string;
    targetAudience: string;
    restrictions?: string[];
    guidance?: string;
  },
): Promise<AIContentGeneration> {
  try {
    // Check if Ollama is available
    const isAvailable = await ollamaClient.isAvailable();
    if (!isAvailable) {
      // Fallback to mock response if Ollama is not available
      console.warn("Ollama is not available, using mock response");
      const mockResponse = {
        originalContent,
        generatedContent: `[Mock AI] ${originalContent} - Optimized for ${context.campaignName}`,
        reasoning: `Mock: Content personalized for ${context.targetAudience} in ${context.campaignName} campaign`,
        confidence: 0.75,
        alternatives: [
          `Mock Alternative 1: ${originalContent} - Enhanced`,
          `Mock Alternative 2: ${originalContent} - Premium`,
        ],
      };
      return AIContentGenerationSchema.parse(mockResponse);
    }

    // Create structured prompt for Ollama
    const prompt = createContentGenerationPrompt(originalContent, context);

    // Call Ollama API
    const response = await ollamaClient.generate({
      model: "llama3.2", // Use your preferred model
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 500,
      },
    });

    // Extract and parse JSON response
    const jsonResponse = extractJSONFromResponse(
      response,
    ) as AIContentGeneration;

    // Validate and return the structured response
    return AIContentGenerationSchema.parse(jsonResponse);
  } catch (error) {
    console.error("AI content generation failed:", error);

    // Fallback to enhanced mock response on error
    const fallbackResponse = {
      originalContent,
      generatedContent: `[Enhanced] ${originalContent.replace(/\b\w/g, (l) => l.toUpperCase())} - Tailored for ${context.campaignName}`,
      reasoning: `Fallback: Enhanced version created due to AI service unavailability. Applied basic improvements for ${context.targetAudience}.`,
      confidence: 0.6,
      alternatives: [
        `Enhanced Alternative: ${originalContent} with improved appeal`,
        `Professional Version: ${originalContent} - optimized for conversion`,
      ],
    };

    return AIContentGenerationSchema.parse(fallbackResponse);
  }
}

// AI IPC Function
export async function aiGenerateIpc(
  action: "update_element" | "add_element" | "remove_element" | "modify_style",
  target: {
    selector: string;
    campaignId: string;
    variantId?: string;
  },
  changes: {
    content?: string;
    styles?: Record<string, string>;
    attributes?: Record<string, string>;
  },
  sessionId: string,
): Promise<AIIPC> {
  // TODO: Replace with actual AI call
  // const prompt = `
  //   Action: ${action}
  //   Target: ${JSON.stringify(target)}
  //   Changes: ${JSON.stringify(changes)}
  //
  //   Generate an IPC command to modify the webpage element.
  //   Return a JSON object with the following structure:
  //   {
  //     "action": "update_element",
  //     "target": { "selector": "css-selector", "campaignId": "id", "variantId": "optional" },
  //     "changes": { "content": "new content", "styles": {}, "attributes": {} },
  //     "metadata": { "timestamp": "ISO-string", "sessionId": "string" }
  //   }
  // `;

  const mockResponse = {
    action,
    target,
    changes,
    metadata: {
      timestamp: new Date().toISOString(),
      userId: undefined,
      sessionId,
    },
  };

  return AIIPCSchema.parse(mockResponse);
}

// Campaign Personalization Function
export async function aiGenerateCampaignPersonalization(
  campaignId: string,
  elements: Array<{
    selector: string;
    originalContent: string;
    aiGenerated: boolean;
    restrictions?: string[];
    guidance?: string;
  }>,
): Promise<CampaignPersonalization> {
  // TODO: Replace with actual AI call
  // const prompt = `
  //   Campaign ID: ${campaignId}
  //   Elements to personalize: ${JSON.stringify(elements)}
  //
  //   Generate a complete campaign personalization plan.
  //   Return a JSON object with the following structure:
  //   {
  //     "campaignId": "string",
  //     "elements": [
  //       {
  //         "selector": "css-selector",
  //         "originalContent": "original text",
  //         "personalizedContent": "new text",
  //         "aiGenerated": true,
  //         "restrictions": ["no emojis"],
  //         "guidance": "make it exciting"
  //       }
  //     ],
  //     "metadata": {
  //       "createdAt": "ISO-string",
  //       "updatedAt": "ISO-string",
  //       "version": "1.0.0"
  //     }
  //   }
  // `;

  const mockResponse = {
    campaignId,
    elements: elements.map((element) => ({
      ...element,
      personalizedContent: `[AI] ${element.originalContent} - Personalized`,
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  return CampaignPersonalizationSchema.parse(mockResponse);
}

// Utility function to validate AI responses
export function validateAIResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown,
): T {
  try {
    return schema.parse(response);
  } catch (error) {
    console.error("AI response validation failed:", error);
    throw new Error("Invalid AI response format");
  }
}
