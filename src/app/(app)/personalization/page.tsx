import { CampaignBuilder } from "~/components/campaign/campaign-builder";

export const revalidate = 60;

export const metadata = {
  title: "Personalization | Campaign Builder",
  description: "Personalize page content for your campaigns",
};

export default function PersonalizationPage() {
  return <CampaignBuilder />;
}
