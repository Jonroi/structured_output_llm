import { z } from "zod";

/**
 * STRUCTURED OUTPUT - ZOD-SKEEMAT JA TYPESCRIPT-TYYPIT
 * ===================================================
 *
 * Tämä tiedosto määrittelee kaikki AI-vastauksille käytettävät Zod-skeemat ja TypeScript-tyypit.
 * Zod-skeemat varmistavat, että AI-vastaukset ovat aina oikeassa muodossa ja sisältävät
 * kaikki tarvittavat kentät. TypeScript-tyypit tarjoavat type-safety:n kehityksen aikana.
 */

// ============================================================================
// ELEMENTTIEN VALINTA - SKEEMAT
// ============================================================================

/**
 * ElementContentSchema - Määrittelee verkkosivun elementin sisällön
 * Käytetään kun käyttäjä valitsee elementin verkkosivulta
 */
export const ElementContentSchema = z.object({
  type: z.enum(["text", "image"]), // Elementin tyyppi: teksti tai kuva
  text: z.string(), // Elementin tekstisisältö
  html: z.string().optional(), // Alkuperäinen HTML-sisältö (valinnainen)
  src: z.string().optional(), // Kuvan URL (valinnainen, vain kuville)
  alt: z.string().optional(), // Kuvan alt-teksti (valinnainen, vain kuville)
});

/**
 * SelectedElementSchema - Määrittelee valitun elementin täydellisen tiedon
 * Sisältää sekä elementin sisällön että sen CSS-selektorin
 */
export const SelectedElementSchema = z.object({
  selector: z.string(), // CSS-selektori elementin löytämiseksi sivulla
  content: ElementContentSchema, // Elementin sisältö (teksti/kuva)
  tagName: z.string(), // HTML-tagin nimi (esim. "h1", "p", "div")
  className: z.string(), // Elementin CSS-luokat
  id: z.string(), // Elementin ID-attribuutti
});

// ============================================================================
// AI-SISÄLLÖN GENEROINTI - SKEEMAT
// ============================================================================

/**
 * AIContentGenerationSchema - Määrittelee AI:n generoiman sisällön rakenteen
 * Tämä on tärkein skeema, joka varmistaa että AI-vastaukset ovat aina oikeassa muodossa
 */
export const AIContentGenerationSchema = z.object({
  originalContent: z.string(), // Alkuperäinen sisältö ennen AI-parannusta
  generatedContent: z.string(), // AI:n parantama sisältö
  reasoning: z.string(), // AI:n selitys mitä muutoksia se teki ja miksi
  confidence: z.number().min(0).max(1), // AI:n luottamus vastaukseen (0-1)
  alternatives: z.array(z.string()).optional(), // Vaihtoehtoiset versiot (valinnainen)
});

// ============================================================================
// AI IPC (INTER-PROCESS COMMUNICATION) - SKEEMAT
// ============================================================================

/**
 * AIIPCSchema - Määrittelee AI:n generoimat komentot verkkosivun muokkaamiseksi
 * Käytetään kun AI haluaa muokata sivun elementtejä ohjelmallisesti
 */
export const AIIPCSchema = z.object({
  action: z.enum([
    "update_element", // Päivitä olemassa oleva elementti
    "add_element", // Lisää uusi elementti
    "remove_element", // Poista elementti
    "modify_style", // Muuta elementin tyylejä
  ]),
  target: z.object({
    selector: z.string(), // CSS-selektori kohde-elementille
    campaignId: z.string(), // Kampanjan ID
    variantId: z.string().optional(), // A/B-testin variantin ID (valinnainen)
  }),
  changes: z.object({
    content: z.string().optional(), // Uusi sisältö (valinnainen)
    styles: z.record(z.string()).optional(), // CSS-tyylit (valinnainen)
    attributes: z.record(z.string()).optional(), // HTML-attribuutit (valinnainen)
  }),
  metadata: z.object({
    timestamp: z.string(), // Komentohetken aikaleima
    userId: z.string().optional(), // Käyttäjän ID (valinnainen)
    sessionId: z.string(), // Istunnon ID
  }),
});

// ============================================================================
// KAMPANJAN PERSONALISATIO - SKEEMAT
// ============================================================================

/**
 * CampaignPersonalizationSchema - Määrittelee koko kampanjan personalisointisuunnitelman
 * Sisältää kaikki kampanjaan liittyvät elementit ja niiden personalisoidut versiot
 */
export const CampaignPersonalizationSchema = z.object({
  campaignId: z.string(), // Kampanjan yksilöllinen ID
  elements: z.array(
    z.object({
      selector: z.string(), // CSS-selektori elementille
      originalContent: z.string(), // Alkuperäinen sisältö
      personalizedContent: z.string(), // Personalisoitu sisältö
      aiGenerated: z.boolean(), // Onko sisältö AI:n generoima
      restrictions: z.array(z.string()).optional(), // AI-rajoitukset (valinnainen)
      guidance: z.string().optional(), // AI-ohjeet (valinnainen)
    })
  ),
  metadata: z.object({
    createdAt: z.string(), // Kampanjan luontiaika
    updatedAt: z.string(), // Viimeisin päivitysaika
    version: z.string(), // Kampanjan versio
  }),
});

// ============================================================================
// TYPESCRIPT-TYYPPIEN EXPORTAUS
// ============================================================================

/**
 * TypeScript-tyypit Zod-skeemojen pohjalta
 * Nämä tyypit tarjoavat type-safety:n kehityksen aikana
 */
export type ElementContent = z.infer<typeof ElementContentSchema>;
export type SelectedElement = z.infer<typeof SelectedElementSchema>;
export type AIContentGeneration = z.infer<typeof AIContentGenerationSchema>;
export type AIIPC = z.infer<typeof AIIPCSchema>;
export type CampaignPersonalization = z.infer<
  typeof CampaignPersonalizationSchema
>;
