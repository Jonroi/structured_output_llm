"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Bot, Save, PlusCircle, Upload } from "lucide-react";
import { useState } from "react";

export function CampaignBuilder() {
  const [isAiManaged, setIsAiManaged] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Campaign Builder
          </h1>
          <p className="text-muted-foreground">
            Visually edit your website for any campaign.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button>Preview</Button>
        </div>
      </header>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4 flex-1">
        <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select defaultValue="summer-sale-2025">
              <SelectTrigger>
                <SelectValue placeholder="Select Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summer-sale-2025">
                  Campaign: Summer Sale
                </SelectItem>
                <SelectSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-start pl-8 pr-2 py-1.5 h-auto font-normal"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Campaign
                </Button>
              </SelectContent>
            </Select>

            <Select defaultValue="utm-google-cpc">
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utm-google-cpc">
                  Source: Google CPC
                </SelectItem>
                <SelectSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-start pl-8 pr-2 py-1.5 h-auto font-normal"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Source
                </Button>
              </SelectContent>
            </Select>

            <Select defaultValue="variant-a">
              <SelectTrigger>
                <SelectValue placeholder="Select A/B Test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="variant-a">A/B Test: Variant A</SelectItem>
                <SelectItem value="variant-b">A/B Test: Variant B</SelectItem>
                <SelectSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-start pl-8 pr-2 py-1.5 h-auto font-normal"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add new A/B test
                </Button>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg flex-1 border">
            <iframe
              src="https://super-site.com"
              className="w-full h-full rounded-lg"
              title="Website Preview"
            />
          </div>
        </div>

        <aside className="md:col-span-1 lg:col-span-1 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Editing Headline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="element-name">Selected item</Label>
                <Input
                  id="element-name"
                  defaultValue="h1 hero"
                  readOnly
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                />
              </div>

              <div>
                <Label htmlFor="headline-text">Content</Label>
                <Textarea
                  id="headline-text"
                  defaultValue="Jokainen vierailu alkaa ensivaikutelmasta – tee siitä hyvä"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-managed-toggle"
                  checked={isAiManaged}
                  onCheckedChange={setIsAiManaged}
                />
                <Label htmlFor="ai-managed-toggle">AI Managed Content</Label>
              </div>

              {isAiManaged && (
                <div className="space-y-4 pl-4 border-l-2 ml-2">
                  <div>
                    <Label htmlFor="ai-restrictions">Restrictions for AI</Label>
                    <Textarea
                      id="ai-restrictions"
                      placeholder="e.g. Do not use emojis."
                    />
                  </div>

                  <div>
                    <Label htmlFor="ai-guidance">Guidance for AI</Label>
                    <Textarea
                      id="ai-guidance"
                      placeholder="e.g. Make it sound exciting."
                    />
                  </div>

                  <div>
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Load Reference Files
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  <Bot className="mr-2 h-4 w-4" /> Generate with AI
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Import from Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
