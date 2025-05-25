
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { MapPin, CalendarClock, Search, Filter, Loader2, AlertTriangle, Info, CheckCircle, XCircle, Handshake } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import type { FoodPost } from "@/types";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function BrowsePage() {
  const [foodItems, setFoodItems] = React.useState<FoodPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<FoodPost | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = React.useState(false);

  const { currentUser, userData } = useAuth();
  const { toast } = useToast();

  const fetchFoodItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "food_donations"),
        // where("status", "==", "available"), // We fetch all and filter/disable UI based on status
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

  React.useEffect(() => {
    fetchFoodItems();
  }, []);

  const handleRequestFood = (item: FoodPost) => {
    setSelectedItem(item);
    setIsRequestDialogOpen(true);
  };

  const handleConfirmRequest = async () => {
    if (!currentUser || userData?.role !== 'recipient') {
      toast({ title: "Action Not Allowed", description: "Only recipients can request food items.", variant: "destructive" });
      return;
    }
    if (!selectedItem || selectedItem.status !== 'available' || !selectedItem.id) {
      toast({ title: "Cannot Request", description: "This item is no longer available or cannot be requested.", variant: "destructive" });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const itemRef = doc(db, "food_donations", selectedItem.id);
      await updateDoc(itemRef, {
        status: "requested",
        requestedByUid: currentUser.uid,
        requestedAt: Timestamp.now(),
      });

      // Update local state
      setFoodItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id
            ? { ...item, status: "requested", requestedByUid: currentUser.uid, requestedAt: Timestamp.now() }
            : item
        )
      );
      toast({ title: "Request Successful!", description: `You have requested ${selectedItem.foodType}.` });
      setIsRequestDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error confirming request:", err);
      toast({ title: "Request Failed", description: err.message || "Could not submit your request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const openGoogleMaps = (location: string) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

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
          <CardTitle>Filter & Search (Placeholder)</CardTitle>
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
                {item.status !== 'available' && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <Badge variant={item.status === 'requested' ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                       {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                     </Badge>
                   </div>
                )}
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
                <Button
                  className="w-full"
                  onClick={() => handleRequestFood(item)}
                  disabled={item.status !== 'available' || !currentUser || userData?.role !== 'recipient'}
                >
                  {item.status === 'available' ? (
                    <>
                      <Handshake className="mr-2 h-4 w-4" /> Request Pickup
                    </>
                  ) : item.status === 'requested' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requested
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Unavailable
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedItem && (
        <Dialog open={isRequestDialogOpen} onOpenChange={(open) => {
          setIsRequestDialogOpen(open);
          if (!open) setSelectedItem(null);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Request: {selectedItem.foodType}
              </DialogTitle>
              <DialogDescription>
                Review the details below and confirm your request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p><strong>Food Type:</strong> {selectedItem.foodType}</p>
              <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
              <p><strong>Donor:</strong> {selectedItem.donorName || "Anonymous Donor"}</p>
              <p><strong>Pickup Location:</strong> {selectedItem.location}</p>
              {selectedItem.expiryDate && (
                <p><strong>Expires by:</strong> {format(selectedItem.expiryDate.toDate(), "PPP")}</p>
              )}
              {selectedItem.pickupInstructions && (
                <p><strong>Instructions:</strong> {selectedItem.pickupInstructions}</p>
              )}
              {selectedItem.postedAt && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Posted: {format(selectedItem.postedAt.toDate(), "PPP p")}
                  </p>
              )}
               <Button variant="outline" onClick={() => openGoogleMaps(selectedItem.location)} className="w-full">
                <MapPin className="mr-2 h-4 w-4" /> View in Map
              </Button>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={handleConfirmRequest} 
                disabled={isSubmittingRequest || selectedItem.status !== 'available' || !currentUser || userData?.role !== 'recipient'}
              >
                {isSubmittingRequest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirm Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
