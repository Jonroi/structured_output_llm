import { CampaignBuilder } from "~/components/campaign/campaign-builder";

export const revalidate = 60;

export const metadata = {
  title: "Dashboard | Campaign Builder",
  description: "Manage and personalize your campaigns",
};

export default function DashboardPage() {
  return <CampaignBuilder />;
}
