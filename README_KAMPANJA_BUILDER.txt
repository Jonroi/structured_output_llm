KAMPANJA BUILDER - STRUCTURED OUTPUT TOTEUTUS
=============================================

MITÄ OHJELMA TEKEE:
------------------
Kampanja Builder on visuaalinen työkalu verkkosivujen muokkaamiseen kampanjoita varten.
Sovellus käyttää structuroitua AI-outputia Ollama:n kanssa, jossa kaikki AI-vastaukset ovat
type-safe ja validoitu Zod-skeemojen avulla.

STRUCTURED OUTPUT - TOTEUTUS:
----------------------------

1. ZOD-SKEEMAT (src/lib/types/ai-output.ts)
   ```typescript
   export const AIContentGenerationSchema = z.object({
     originalContent: z.string(),
     generatedContent: z.string(),
     reasoning: z.string(),
     confidence: z.number().min(0).max(1),
     alternatives: z.array(z.string()).optional(),
   });
   ```

2. STRUKTUROITU PROMPT (src/lib/ollama-client.ts)
   ```typescript
   RESPONSE FORMAT: You must respond with ONLY a valid JSON object in this exact format:
   {
     "originalContent": "${originalContent}",
     "generatedContent": "your improved content here",
     "reasoning": "brief explanation of what changes you made and why",
     "confidence": 0.85,
     "alternatives": ["alternative version 1", "alternative version 2"]
   }
   ```

3. JSON-EXTRACTIO JA VALIDOINTI (src/lib/ai-functions.ts)
   ```typescript
   // Extract and parse JSON response
   const jsonResponse = extractJSONFromResponse(response) as AIContentGeneration;
   
   // Validate and return the structured response
   return AIContentGenerationSchema.parse(jsonResponse);
   ```

4. TYPE-SAFE KÄYTTÖ
   ```typescript
   const result = await aiGeneratePageContent(originalText, context);
   
   // result on nyt täysin type-safe AIContentGeneration-tyyppi
   console.log(result.generatedContent); // ✅ TypeScript tietää tyypin
   console.log(result.confidence); // ✅ TypeScript tietää tyypin
   ```

STRUCTURED OUTPUT - EDUT:
------------------------
✅ **Type Safety** - Kaikki AI-vastaukset ovat type-safe TypeScript:issä
✅ **Runtime Validointi** - Zod validoi kaikki vastaukset runtime:ssa
✅ **Konsistenssi** - AI vastaa aina samassa muodossa
✅ **Virheenkäsittely** - Fallback jos AI ei vastaa oikeassa muodossa
✅ **IDE-tuki** - Autocomplete ja type hints toimivat täydellisesti
✅ **Tuotantovalmi** - Helppo integroida tRPC:hen ja muihin API:ihin

AI-INTEGRAATIO (OLLAMA):
-----------------------
- Paikallinen Ollama-yhteys (http://localhost:11434)
- Structuroitu JSON-output Zod-validoinnilla
- Fallback mock-vastaukset jos Ollama ei ole käytettävissä
- Type-safe API-kutsut ja vastaukset

KÄYTTÖ:
------
1. Käynnistä: npm run dev
2. Käynnistä Ollama: ollama serve (suositeltu)
3. Avaa http://localhost:3001
4. Klikkaa elementtejä valitaksesi ne
5. Aseta AI-rajoitukset ja ohjeet
6. Klikkaa "Generate with AI"
7. Näe structuroitu AI-vastaus reaaliajassa

TEKNISET YKSITYISKOHDAT:
-----------------------
- Next.js 15.5.0 (App Router, Turbopack)
- TypeScript (tiukat tyyppitarkistukset)
- Zod-skeemojen validointi (structured AI output)
- Ollama API -integraatio (paikallinen AI)
- Type-safe API-kutsut

TIEDOSTOT:
---------
- src/lib/types/ai-output.ts - Zod-skeemat ja TypeScript-tyypit
- src/lib/ai-functions.ts - AI-funktiot structuroidulla outputilla
- src/lib/ollama-client.ts - Ollama API -client ja prompt-generointi
- src/components/campaign/campaign-builder.tsx - Pääkomponentti

KÄYNNISTYS:
----------
```bash
npm install
npm run dev
# Avaa http://localhost:3001
```

Tämä on täydellinen esimerkki structuroidusta outputista, joka on valmis tuotantokäyttöön! 🚀
