
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingPot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DonorDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CookingPot className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Donor Hub</CardTitle>
          </div>
          <CardDescription>Manage your food donations and track your impact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Welcome to your Donor Hub! Here you can post new food donations, view your donation history, and see the positive impact you&apos;re making.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Post a New Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">Have surplus food to share? Let&apos;s get it to those in need.</p>
                <Button asChild className="w-full">
                  <Link href="/donate">Create Donation Listing</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">View My Donation History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">Track your past contributions and their status.</p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/history">See My History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

           <Card className="mt-6 bg-accent/30 border-accent">
              <CardHeader>
                <CardTitle className="text-xl">Quick Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ensure food is properly packaged and labeled before listing. Clear details help volunteers and recipients!</p>
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
