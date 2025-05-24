"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lightbulb, Loader2 } from "lucide-react";
import { generateFoodTip, type GenerateFoodTipInput, type GenerateFoodTipOutput } from "@/ai/flows/generate-food-tip"; // Ensure correct path

export default function FoodTipGenerator() {
  const [foodItem, setFoodItem] = useState("");
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTip = async () => {
    if (!foodItem.trim()) {
      setError("Please enter a food item.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTip(null);
    try {
      const input: GenerateFoodTipInput = { foodItem };
      const result: GenerateFoodTipOutput = await generateFoodTip(input);
      setTip(result.tip);
    } catch (err) {
      console.error("Error generating tip:", err);
      setError("Failed to generate tip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          AI Food Safety & Sustainability Tip
        </CardTitle>
        <CardDescription>
          Enter a food item to get a helpful tip on safe handling and sustainability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodItem">Food Item</Label>
          <div className="flex space-x-2">
            <Input
              id="foodItem"
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="e.g., Chicken, Lettuce, Bread"
              disabled={isLoading}
            />
            <Button onClick={handleGenerateTip} disabled={isLoading || !foodItem.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Get Tip"
              )}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      {(isLoading || tip) && (
        <CardFooter>
          {isLoading && !tip && (
            <div className="flex items-center text-muted-foreground w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Generating your tip...</span>
            </div>
          )}
          {tip && !isLoading && (
            <Card className="w-full bg-accent/30 border-accent">
              <CardHeader>
                <CardTitle className="text-lg">Tip for {foodItem}:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{tip}</p>
              </CardContent>
            </Card>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
