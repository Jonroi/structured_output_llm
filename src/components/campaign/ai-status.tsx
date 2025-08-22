"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Zap, AlertCircle, CheckCircle } from "lucide-react";
import { ollamaClient } from "~/lib/ollama-client";

export function AIStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const available = await ollamaClient.isAvailable();
        setIsAvailable(available);
        
        if (available) {
          const modelList = await ollamaClient.listModels();
          setModels(modelList);
        }
      } catch (error) {
        console.error("Failed to check Ollama status:", error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOllamaStatus();
  }, []);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          AI Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-2">
          {isAvailable ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ollama Connected
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Ollama Offline
              </Badge>
            </>
          )}
        </div>
        
        {isAvailable && models.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Models: {models.slice(0, 3).join(", ")}
            {models.length > 3 && ` +${models.length - 3} more`}
          </div>
        )}
        
        {!isAvailable && (
          <div className="text-xs text-muted-foreground">
            Using fallback AI responses. Start Ollama with: <code>ollama serve</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
