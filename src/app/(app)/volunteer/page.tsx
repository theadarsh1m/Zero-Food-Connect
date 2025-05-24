
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, HandHelping } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VolunteerDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <HandHelping className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Volunteer Hub</CardTitle>
          </div>
          <CardDescription>Find pickup requests, manage your deliveries, and track your contributions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Welcome to your Volunteer Hub! You play a crucial role in connecting food donors with recipients. Thank you for your help!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Available Pickup Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">Browse food pickup tasks that need your help for delivery.</p>
                <Button asChild className="w-full">
                  <Link href="/pickups">View Pickup Requests</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">My Fulfilled Pickups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">See a history of the pickups you have successfully completed.</p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/history?tab=pickups">See My Pickup History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-accent/30 border-accent">
              <CardHeader>
                <CardTitle className="text-xl">Quick Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Coordinate clearly with both donor and recipient for smooth handovers. Confirm times and locations.</p>
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
