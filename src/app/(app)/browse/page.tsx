
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarClock, Search, Filter, Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import type { FoodPost } from "@/types";
import { format } from "date-fns";

export default function BrowsePage() {
  const [foodItems, setFoodItems] = React.useState<FoodPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "food_donations"),
          where("status", "==", "available"),
          orderBy("postedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FoodPost[];
        setFoodItems(fetchedItems);
      } catch (err: any) {
        console.error("Error fetching food items:", err);
        setError("Failed to load available food items. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Available Food</h1>
        <p className="text-muted-foreground">
          Find surplus food donations near you. Request a pickup to help reduce waste.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by food type, keyword..." className="pl-10" />
          </div>
          <Input placeholder="Enter your location (e.g., ZIP code, city)" className="md:max-w-xs" />
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg">Loading food donations...</p>
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-10 flex flex-col items-center text-destructive text-center">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h3>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && foodItems.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Food Items Found</h3>
            <p className="text-muted-foreground">Check back later or adjust your filters. No available donations at the moment.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && foodItems.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {foodItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-48 bg-muted">
                <Image 
                  src={item.imageUrl || "https://placehold.co/300x200.png"} 
                  alt={item.foodType} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={!item.imageUrl ? "food placeholder" : undefined}
                />
              </div>
              <CardHeader>
                <CardTitle>{item.foodType}</CardTitle>
                <CardDescription>Donated by: {item.donorName || "Anonymous Donor"}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-sm"><Badge variant="secondary" className="mr-1">Quantity:</Badge> {item.quantity}</p>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                  <span>{item.location}</span>
                </div>
                {item.expiryDate && (
                  <div className="flex items-center text-sm">
                    <CalendarClock className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                    <span>Expires: {format(item.expiryDate.toDate(), "PPP")}</span>
                  </div>
                )}
                 {item.postedAt && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Posted: {format(item.postedAt.toDate(), "PPP p")}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full">Request Pickup</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
