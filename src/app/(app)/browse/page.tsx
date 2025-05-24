import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarClock, Search, Filter } from "lucide-react";
import Image from "next/image";

// Mock data for food items
const mockFoodItems = [
  {
    id: "1",
    type: "Fresh Vegetables",
    quantity: "Approx. 10 kg mixed greens",
    location: "Downtown Community Center",
    expiryWindow: "Best by Tomorrow Evening",
    imageUrl: "https://placehold.co/300x200.png",
    dataAiHint: "fresh vegetables",
    donor: "Green Grocer"
  },
  {
    id: "2",
    type: "Bakery Surplus",
    quantity: "3 boxes of assorted pastries",
    location: "Maria's Cafe, 123 Main St",
    expiryWindow: "Today Only",
    imageUrl: "https://placehold.co/300x200.png",
    dataAiHint: "pastries bread",
    donor: "Maria's Cafe"
  },
  {
    id: "3",
    type: "Cooked Meals",
    quantity: "15 individually packed meals (Chicken & Rice)",
    location: "North End Soup Kitchen (pickup only)",
    expiryWindow: "Use by this evening",
    imageUrl: "https://placehold.co/300x200.png",
    dataAiHint: "cooked meal",
    donor: "Anonymous Donor via App"
  },
];

export default function BrowsePage() {
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockFoodItems.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-48">
              <Image 
                src={item.imageUrl} 
                alt={item.type} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={item.dataAiHint} 
              />
            </div>
            <CardHeader>
              <CardTitle>{item.type}</CardTitle>
              <CardDescription>Donated by: {item.donor}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <p className="text-sm"><Badge variant="secondary" className="mr-1">Quantity:</Badge> {item.quantity}</p>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <CalendarClock className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                <span>{item.expiryWindow}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Request Pickup</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {mockFoodItems.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Food Items Found</h3>
            <p className="text-muted-foreground">Check back later or adjust your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
