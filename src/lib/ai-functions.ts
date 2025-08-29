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
  createIpcGenerationPrompt,
  createCampaignPersonalizationPrompt,
} from "~/lib/ollama-client";

/**
 * AI-FUNKTIOT - STRUCTURED OUTPUT - TOTEUTUS
 * ==========================================
 *
 * Tämä tiedosto sisältää kaikki AI-toiminnallisuudet, jotka käyttävät structured output -tekniikkaa.
 * Kaikki funktiot palauttavat type-safe vastaukset, jotka on validoitu Zod-skeemojen avulla.
 *
 * Tärkeimmät ominaisuudet:
 * - Type-safe AI-kutsut
 * - Zod-validointi kaikille vastauksille
 * - Fallback-toiminnallisuus virhetilanteissa
 * - Structured JSON-output Ollama:n kanssa
 */

// ============================================================================
// AI-SISÄLLÖN GENEROINTI - PÄÄFUNKTIO
// ============================================================================

/**
 * aiGeneratePageContent - Pääfunktio AI:n sisällön generoimiseksi
 *
 * Tämä funktio on structured output -toteutuksen ydin. Se:
 * 1. Kutsuu Ollama API:a structuroidulla promptilla
 * 2. Parsii AI:n JSON-vastauksen
 * 3. Validoi vastauksen Zod-skeemalla
 * 4. Palauttaa type-safe AIContentGeneration-objektin
 *
 * @param originalContent - Alkuperäinen sisältö, jota parannetaan
 * @param context - Konteksti AI:lle (kampanja, kohderyhmä, rajoitukset, ohjeet)
 * @returns Promise<AIContentGeneration> - Type-safe AI-vastaus
 */
export async function aiGeneratePageContent(
  originalContent: string,
  context: {
    campaignName: string; // Kampanjan nimi (esim. "Summer Sale 2025")
    targetAudience: string; // Kohderyhmä (esim. "Young professionals")
    restrictions?: string[]; // AI-rajoitukset (esim. ["Ei emoji", "Ammatillinen sävy"])
    guidance?: string; // AI-ohjeet (esim. "Tee siitä jännittävä")
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
  try {
    // Check if Ollama is available
    const isAvailable = await ollamaClient.isAvailable();
    if (!isAvailable) {
      console.warn("Ollama is not available, using mock IPC response");
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

    // Create structured prompt for IPC generation
    const prompt = createIpcGenerationPrompt(
      action,
      target,
      changes,
      sessionId,
    );

    // Call Ollama API
    const response = await ollamaClient.generate({
      model: "llama3.2",
      prompt,
      options: {
        temperature: 0.3, // Lower temperature for more consistent IPC commands
        top_p: 0.9,
        num_predict: 300,
      },
    });

    // Extract and parse JSON response
    const jsonResponse = extractJSONFromResponse(response) as AIIPC;

    // Validate and return the structured response
    return AIIPCSchema.parse(jsonResponse);
  } catch (error) {
    console.error(
      "AI IPC generation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    // Fallback to mock response on error
    const fallbackResponse = {
      action,
      target,
      changes,
      metadata: {
        timestamp: new Date().toISOString(),
        userId: undefined,
        sessionId,
      },
    };

    return AIIPCSchema.parse(fallbackResponse);
  }
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
  try {
    // Check if Ollama is available
    const isAvailable = await ollamaClient.isAvailable();
    if (!isAvailable) {
      console.warn(
        "Ollama is not available, using mock campaign personalization",
      );
      const mockResponse = {
        campaignId,
        elements: elements.map((element) => ({
          ...element,
          personalizedContent: `[Mock AI] ${element.originalContent} - Personalized for ${campaignId}`,
        })),
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      };
      return CampaignPersonalizationSchema.parse(mockResponse);
    }

    // Create structured prompt for campaign personalization
    const prompt = createCampaignPersonalizationPrompt(campaignId, elements);

    // Call Ollama API
    const response = await ollamaClient.generate({
      model: "llama3.2",
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 800, // Higher limit for multiple elements
      },
    });

    // Extract and parse JSON response
    const jsonResponse = extractJSONFromResponse(
      response,
    ) as CampaignPersonalization;

    // Validate and return the structured response
    return CampaignPersonalizationSchema.parse(jsonResponse);
  } catch (error) {
    console.error(
      "AI campaign personalization failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    // Fallback to enhanced mock response on error
    const fallbackResponse = {
      campaignId,
      elements: elements.map((element) => ({
        ...element,
        personalizedContent: `[Enhanced] ${element.originalContent} - Optimized for ${campaignId} campaign`,
      })),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };

    return CampaignPersonalizationSchema.parse(fallbackResponse);
  }
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
