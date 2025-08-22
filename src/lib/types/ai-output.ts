import { z } from "zod";

// Element selection types
export const ElementContentSchema = z.object({
  type: z.enum(["text", "image"]),
  text: z.string(),
  html: z.string().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
});

export const SelectedElementSchema = z.object({
  selector: z.string(),
  content: ElementContentSchema,
  tagName: z.string(),
  className: z.string(),
  id: z.string(),
});

// AI Content Generation Schema
export const AIContentGenerationSchema = z.object({
  originalContent: z.string(),
  generatedContent: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.string()).optional(),
});

// AI IPC (Inter-Process Communication) Schema
export const AIIPCSchema = z.object({
  action: z.enum([
    "update_element",
    "add_element",
    "remove_element",
    "modify_style",
  ]),
  target: z.object({
    selector: z.string(),
    campaignId: z.string(),
    variantId: z.string().optional(),
  }),
  changes: z.object({
    content: z.string().optional(),
    styles: z.record(z.string()).optional(),
    attributes: z.record(z.string()).optional(),
  }),
  metadata: z.object({
    timestamp: z.string(),
    userId: z.string().optional(),
    sessionId: z.string(),
  }),
});

// Campaign Personalization Schema
export const CampaignPersonalizationSchema = z.object({
  campaignId: z.string(),
  elements: z.array(
    z.object({
      selector: z.string(),
      originalContent: z.string(),
      personalizedContent: z.string(),
      aiGenerated: z.boolean(),
      restrictions: z.array(z.string()).optional(),
      guidance: z.string().optional(),
    }),
  ),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.string(),
  }),
});

// Export types
export type ElementContent = z.infer<typeof ElementContentSchema>;
export type SelectedElement = z.infer<typeof SelectedElementSchema>;
export type AIContentGeneration = z.infer<typeof AIContentGenerationSchema>;
export type AIIPC = z.infer<typeof AIIPCSchema>;
export type CampaignPersonalization = z.infer<
  typeof CampaignPersonalizationSchema
>;
