
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Handshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecipientDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Handshake className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Recipient Hub</CardTitle>
          </div>
          <CardDescription>Find available food donations and manage your requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Welcome to your Recipient Hub! Browse for available food, request items, and track what you&apos;ve received.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Browse Available Food</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">Find surplus food donations currently available in your area.</p>
                <Button asChild className="w-full">
                  <Link href="/browse">Find Food Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">My Received Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">View a history of food items you have successfully received.</p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/history?tab=received">See My History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-accent/30 border-accent">
              <CardHeader>
                <CardTitle className="text-xl">Quick Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Clearly specify your needs and pickup capacity when requesting food to ensure a smooth process.</p>
                 <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href="/tips">Get more AI Food Tips</Link>
                </Button>
              </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
