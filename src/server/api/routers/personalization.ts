import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  aiGeneratePageContent,
  aiGenerateIpc,
  aiGenerateCampaignPersonalization,
} from "~/lib/ai-functions";
import {
  AIContentGenerationSchema,
  AIIPCSchema,
  CampaignPersonalizationSchema,
} from "~/lib/types/ai-output";

export const personalizationRouter = createTRPCRouter({
  // Generate AI content for a specific element
  generateContent: publicProcedure
    .input(
      z.object({
        originalContent: z.string(),
        campaignName: z.string(),
        targetAudience: z.string(),
        restrictions: z.array(z.string()).optional(),
        guidance: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await aiGeneratePageContent(input.originalContent, {
        campaignName: input.campaignName,
        targetAudience: input.targetAudience,
        restrictions: input.restrictions,
        guidance: input.guidance,
      });

      return result;
    }),

  // Generate IPC command for element modification
  generateIpc: publicProcedure
    .input(
      z.object({
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
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await aiGenerateIpc(
        input.action,
        input.target,
        input.changes,
        input.sessionId
      );

      return result;
    }),

  // Generate complete campaign personalization
  generateCampaignPersonalization: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        elements: z.array(
          z.object({
            selector: z.string(),
            originalContent: z.string(),
            aiGenerated: z.boolean(),
            restrictions: z.array(z.string()).optional(),
            guidance: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const result = await aiGenerateCampaignPersonalization(
        input.campaignId,
        input.elements
      );

      return result;
    }),

  // Save personalized element
  saveElement: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        selector: z.string(),
        originalContent: z.string(),
        personalizedContent: z.string(),
        aiGenerated: z.boolean(),
        restrictions: z.array(z.string()).optional(),
        guidance: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Save to database
      return {
        id: `element-${Date.now()}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
    }),

  // Get personalized elements for a campaign
  getElements: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Fetch from database
      return [
        {
          id: "element-1",
          campaignId: input.campaignId,
          selector: "h1.hero",
          originalContent: "Welcome to our site",
          personalizedContent: "Welcome to our amazing site!",
          aiGenerated: true,
          restrictions: ["No emojis"],
          guidance: "Make it exciting",
          createdAt: new Date().toISOString(),
        },
      ];
    }),

  // Apply personalization to website
  applyPersonalization: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        websiteUrl: z.string(),
        elements: z.array(
          z.object({
            selector: z.string(),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Apply changes to website via proxy
      return {
        success: true,
        appliedElements: input.elements.length,
        timestamp: new Date().toISOString(),
      };
    }),
});
