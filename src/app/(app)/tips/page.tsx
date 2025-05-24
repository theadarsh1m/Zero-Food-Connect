import FoodTipGenerator from "@/components/ai/FoodTipGenerator";

export default function AITipsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Food Tips</h1>
        <p className="text-muted-foreground">
          Get AI-powered advice on handling food safely and reducing waste.
        </p>
      </div>
      <FoodTipGenerator />
    </div>
  );
}
