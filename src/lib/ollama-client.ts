import { z } from "zod";

/**
 * OLLAMA API - CLIENT JA STRUCTURED OUTPUT - TOTEUTUS
 * ===================================================
 *
 * Tämä tiedosto sisältää Ollama API:n client-toteutuksen ja structured output -toiminnallisuuden.
 * Se tarjoaa metodit AI:n kutsumiseksi, JSON-vastauksen parsintaan ja structuroitujen promptien luomiseen.
 */

// ============================================================================
// OLLAMA API - KONFIGURAATIO JA SKEEMAT
// ============================================================================

/**
 * OllamaResponseSchema - Määrittelee Ollama API:n vastauksen rakenteen
 * Käytetään validoimaan, että Ollama palauttaa oikean muotoisen vastauksen
 */
const OllamaResponseSchema = z.object({
  model: z.string(), // Käytetty AI-mallin nimi
  created_at: z.string(), // Vastauksen luontiaika
  response: z.string(), // AI:n tekstivastaus (sisältää JSON:in)
  done: z.boolean(), // Onko vastaus valmis
});

/**
 * Ollama API:n konfiguraatio
 * Oletuksena Ollama pyörii paikallisesti portissa 11434
 */
const OLLAMA_BASE_URL = "http://localhost:11434";

// ============================================================================
// OLLAMA API - TYYPIT JA INTERFACET
// ============================================================================

/**
 * OllamaGenerateRequest - Määrittelee Ollama API:n generointipyynnön rakenteen
 * Sisältää kaikki tarvittavat parametrit AI:n kutsumiseksi
 */
export interface OllamaGenerateRequest {
  model: string; // Käytettävä AI-mallin nimi (esim. "llama3.2")
  prompt: string; // AI:lle lähetettävä prompt
  stream?: boolean; // Haluatko streaming-vastauksen (ei käytössä)
  options?: {
    temperature?: number; // AI:n luovuuden taso (0-1, korkeampi = luovempi)
    top_p?: number; // Nucleus sampling parametri
    top_k?: number; // Top-k sampling parametri
    num_predict?: number; // Maksimimäärä generoitavia tokenia
  };
}

// ============================================================================
// OLLAMA CLIENT - LUOKKA
// ============================================================================

/**
 * OllamaClient - Luokka Ollama API:n kutsumiseksi
 * Tarjoaa metodit AI:n kutsumiseksi, mallien listaukseen ja yhteystilan tarkistamiseen
 */
export class OllamaClient {
  private baseUrl: string; // Ollama API:n perus-URL

  /**
   * Konstruktori - alustaa Ollama clientin
   * @param baseUrl - Ollama API:n URL (oletuksena localhost:11434)
   */
  constructor(baseUrl: string = OLLAMA_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * generate - Kutsuu Ollama API:a sisällön generoimiseksi
   * Tämä on päämetodi AI:n kutsumiseksi structured output -toiminnallisuudessa
   *
   * @param request - Ollama API:n generointipyyntö
   * @returns Promise<string> - AI:n tekstivastaus (sisältää JSON:in)
   * @throws Error jos API-kutsu epäonnistuu
   */
  async generate(request: OllamaGenerateRequest): Promise<string> {
    try {
      // Lähetä POST-pyyntö Ollama API:lle
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...request,
          stream: false, // Haluamme yhden vastauksen, ei streaming-vastauksia
        }),
      });

      // Tarkista että vastaus on onnistunut
      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`
        );
      }

      // Parsii JSON-vastauksen ja validoi se Zod-skeemalla
      const data = (await response.json()) as unknown;
      const parsed = OllamaResponseSchema.parse(data);

      // Palauta AI:n tekstivastaus (sisältää structuroidun JSON:in)
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
