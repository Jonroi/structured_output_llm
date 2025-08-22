import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const campaignRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // TODO: Implement campaign fetching from database
    return [
      { id: "summer-sale-2025", name: "Summer Sale", status: "active" },
      { id: "winter-campaign", name: "Winter Campaign", status: "draft" },
    ];
  }),

  create: publicProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement campaign creation in database
      return {
        id: `campaign-${Date.now()}`,
        name: input.name,
        description: input.description,
        status: "draft",
      };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "active", "paused", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement campaign update in database
      return {
        id: input.id,
        name: input.name || "Updated Campaign",
        description: input.description,
        status: input.status || "draft",
      };
    }),

  getSources: publicProcedure.query(async ({ ctx }) => {
    // TODO: Implement source fetching from database
    return [
      { id: "utm-google-cpc", name: "Google CPC", type: "paid" },
      { id: "utm-facebook", name: "Facebook Ads", type: "paid" },
      { id: "utm-organic", name: "Organic Search", type: "free" },
    ];
  }),

  getVariants: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Implement A/B test variants fetching from database
      return [
        { id: "variant-a", name: "Variant A", status: "active" },
        { id: "variant-b", name: "Variant B", status: "draft" },
      ];
    }),
});
