"use client";

/**
 * CAMPAIGN BUILDER - PÄÄKOMPONENTTI
 * =================================
 *
 * Tämä on sovelluksen pääkomponentti, joka tarjoaa visuaalisen työkalun
 * verkkosivujen muokkaamiseen kampanjoita varten. Se integroi:
 *
 * - Elementtien visuaalisen valinnan iframe:ssä
 * - AI-generoinnin Ollama:n kanssa
 * - Structured output -toiminnallisuuden
 * - Reaaliaikaisen sisällön muokkauksen
 *
 * Tärkeimmät ominaisuudet:
 * - Proxy-järjestelmä ulkoisten sivujen lataamiseen
 * - AI-integraatio structuroidulla outputilla
 * - Type-safe tietojen käsittely
 * - Responsive design
 */

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
import { Bot, Save, PlusCircle, Upload, Globe, Settings } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { SelectedElement } from "~/lib/types/ai-output";
import { aiGeneratePageContent } from "~/lib/ai-functions";
import { AIStatus } from "./ai-status";

export function CampaignBuilder() {
  // ============================================================================
  // STATE-MUUTTUJAT - KOMPONENTIN TILA
  // ============================================================================

  // AI-toiminnallisuuden tila
  const [isAiManaged, setIsAiManaged] = useState(true); // Onko AI-hallinta käytössä
  const [isGenerating, setIsGenerating] = useState(false); // Onko AI-generointi käynnissä
  const [aiRestrictions, setAiRestrictions] = useState(""); // AI-rajoitukset (esim. "Ei emoji")
  const [aiGuidance, setAiGuidance] = useState(""); // AI-ohjeet (esim. "Tee siitä jännittävä")

  // Elementtien valinta ja muokkaus
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null); // Tällä hetkellä valittu elementti
  const [personalizedElements, setPersonalizedElements] = useState<
    SelectedElement[]
  >([]); // Kaikki muokatut elementit

  // Verkkosivun lataus ja proxy
  const [targetUrl, setTargetUrl] = useState("/api/test-page"); // Ladattavan sivun URL
  const [isProxyReady, setIsProxyReady] = useState(false); // Onko proxy-valmis (iframe on latautunut)

  // DOM-referenssit
  const iframeRef = useRef<HTMLIFrameElement>(null); // Referenssi iframe-elementtiin

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type: string; data?: SelectedElement };
      if (data?.type === "PROXY_READY") {
        setIsProxyReady(true);
      } else if (data?.type === "ELEMENT_SELECTED" && data.data) {
        const element: SelectedElement = data.data;
        setSelectedElement(element);

        // Add to personalized elements if not already there
        if (
          !personalizedElements.find((el) => el.selector === element.selector)
        ) {
          setPersonalizedElements((prev) => [...prev, element]);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [personalizedElements]);

  // Generate AI content for selected element
  const handleGenerateAI = async () => {
    if (!selectedElement || isGenerating) return;

    setIsGenerating(true);

    try {
      // Parse restrictions from input
      const restrictions = aiRestrictions
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const result = await aiGeneratePageContent(selectedElement.content.text, {
        campaignName: "Summer Sale 2025",
        targetAudience: "Young professionals",
        restrictions: restrictions.length > 0 ? restrictions : undefined,
        guidance: aiGuidance || undefined,
      });

      // Update the selected element with AI-generated content
      setSelectedElement((prev) =>
        prev
          ? {
              ...prev,
              content: {
                ...prev.content,
                text: result.generatedContent,
              },
            }
          : null
      );

      // Update in personalized elements list
      setPersonalizedElements((prev) =>
        prev.map((el) =>
          el.selector === selectedElement.selector
            ? {
                ...el,
                content: { ...el.content, text: result.generatedContent },
              }
            : el
        )
      );

      console.log("AI Generation Result:", result);
    } catch (error) {
      console.error("AI generation failed:", error);
      // You could add a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  // Load website in proxy
  const loadWebsite = useCallback(() => {
    // Reset proxy ready state when loading new page
    setIsProxyReady(false);

    // If it's a relative URL, make it absolute
    let fullUrl = targetUrl;
    if (targetUrl.startsWith("/")) {
      fullUrl = `${window.location.origin}${targetUrl}`;
    } else if (!targetUrl.startsWith("http")) {
      fullUrl = `https://${targetUrl}`;
    }

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
    if (iframeRef.current) {
      iframeRef.current.src = proxyUrl;
    }
  }, [targetUrl]);

  // Auto-load the test page on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadWebsite();
    }, 100); // Small delay to ensure iframe is ready

    return () => clearTimeout(timer);
  }, [loadWebsite]); // Add loadWebsite back now that it's properly memoized

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
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

      <div className="grid flex-1 gap-6 pt-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex h-full flex-col gap-4 md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  className="h-auto w-full justify-start py-1.5 pr-2 pl-8 font-normal"
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
                  className="h-auto w-full justify-start py-1.5 pr-2 pl-8 font-normal"
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
                  className="h-auto w-full justify-start py-1.5 pr-2 pl-8 font-normal"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add new A/B test
                </Button>
              </SelectContent>
            </Select>
          </div>

          {/* Website URL Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={targetUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTargetUrl(e.target.value)
                  }
                  placeholder="Enter website URL to customize"
                  className="w-full"
                />
              </div>
              <Button onClick={loadWebsite} className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Load
              </Button>
            </div>
            <div className="text-muted-foreground text-xs">
              💡 Try our test page: <code>/api/test-page</code> or enter any
              website URL
            </div>
          </div>

          {/* Website Preview with Element Selection */}
          <div className="bg-muted/30 relative flex-1 rounded-lg border">
            {!isProxyReady && (
              <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-center">
                  <Settings className="mx-auto mb-2 h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Loading website for element selection...
                  </p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="h-full w-full rounded-lg"
              title="Website Preview"
            />
          </div>
        </div>

        <aside className="flex h-full flex-col gap-4 md:col-span-1 lg:col-span-1">
          <AIStatus />

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>
                {selectedElement ? "Editing Element" : "Select Element"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedElement ? (
                <>
                  <div>
                    <Label htmlFor="element-selector">CSS Selector</Label>
                    <Input
                      id="element-selector"
                      value={selectedElement.selector}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="element-content">Content</Label>
                    <Textarea
                      id="element-content"
                      value={selectedElement.content.text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setSelectedElement((prev) =>
                          prev
                            ? {
                                ...prev,
                                content: {
                                  ...prev.content,
                                  text: e.target.value,
                                },
                              }
                            : null
                        );
                      }}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ai-managed-toggle"
                      checked={isAiManaged}
                      onCheckedChange={setIsAiManaged}
                    />
                    <Label htmlFor="ai-managed-toggle">
                      AI Managed Content
                    </Label>
                  </div>

                  {isAiManaged && (
                    <div className="ml-2 space-y-4 border-l-2 pl-4">
                      <div>
                        <Label htmlFor="ai-restrictions">
                          Restrictions for AI
                        </Label>
                        <Textarea
                          id="ai-restrictions"
                          placeholder="e.g. Do not use emojis, Keep it professional"
                          value={aiRestrictions}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setAiRestrictions(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="ai-guidance">Guidance for AI</Label>
                        <Textarea
                          id="ai-guidance"
                          placeholder="e.g. Make it sound exciting and action-oriented"
                          value={aiGuidance}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setAiGuidance(e.target.value)}
                        />
                      </div>

                      <div>
                        <Button variant="outline" className="w-full">
                          <Upload className="mr-2 h-4 w-4" /> Load Reference
                          Files
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Settings className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" /> Generate with AI
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Import from Wizard
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground text-center">
                  <Globe className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Click on any element in the website to start editing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
