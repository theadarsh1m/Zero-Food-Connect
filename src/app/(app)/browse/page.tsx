
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { MapPin, CalendarClock, Search, Filter, Loader2, AlertTriangle, Info, CheckCircle, XCircle, Handshake, Send, Bike } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp, doc, updateDoc, addDoc } from "firebase/firestore";
import type { FoodPost, FoodDeliveryRequest } from "@/types";
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
        // Fetch items that are explicitly 'available' or still marked as 'requested' (legacy or general interest)
        // Consider if 'requested' should still be fetched for general browsing if it means "interest shown" vs "actively being processed"
        where("status", "in", ["available", "requested"]), 
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

  const handleOpenRequestDialog = (item: FoodPost) => {
    setSelectedItem(item);
    setIsRequestDialogOpen(true);
  };

  const handleSelfPickup = async () => {
    if (!currentUser || userData?.role !== 'recipient' || !selectedItem || !selectedItem.id) {
      toast({ title: "Action Not Allowed", description: "Unable to process self-pickup request.", variant: "destructive" });
      return;
    }
    if (selectedItem.status !== 'available' && selectedItem.status !== 'requested') {
      toast({ title: "Cannot Request", description: "This item is no longer available for pickup.", variant: "destructive" });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const itemRef = doc(db, "food_donations", selectedItem.id);
      await updateDoc(itemRef, {
        status: "claimed_by_recipient",
        claimedByUid: currentUser.uid,
        requestedByUid: currentUser.uid, // also set requestedBy for general tracking
        claimType: "self-pickup",
        requestedAt: Timestamp.now(),
      });

      setFoodItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id
            ? { ...item, status: "claimed_by_recipient", claimedByUid: currentUser.uid, requestedByUid: currentUser.uid, claimType: "self-pickup", requestedAt: Timestamp.now() }
            : item
        ).filter(item => item.status === 'available' || item.status === 'requested') // Or refetch
      );
      toast({ title: "Pickup Confirmed!", description: `You will pick up ${selectedItem.foodType}. Please check pickup instructions.` });
      setIsRequestDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error confirming self-pickup:", err);
      toast({ title: "Request Failed", description: err.message || "Could not submit your self-pickup request.", variant: "destructive" });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleRequestVolunteerDelivery = async () => {
    if (!currentUser || userData?.role !== 'recipient' || !selectedItem || !selectedItem.id) {
      toast({ title: "Action Not Allowed", description: "Unable to process delivery request.", variant: "destructive" });
      return;
    }
     if (selectedItem.status !== 'available' && selectedItem.status !== 'requested') {
      toast({ title: "Cannot Request", description: "This item is no longer available for delivery request.", variant: "destructive" });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      // 1. Create a new delivery request document
      const deliveryRequestData: FoodDeliveryRequest = {
        donationId: selectedItem.id,
        donorId: selectedItem.donorId,
        donorName: selectedItem.donorName,
        foodType: selectedItem.foodType,
        quantity: selectedItem.quantity,
        pickupLocation: selectedItem.location,
        pickupLatitude: selectedItem.latitude,
        pickupLongitude: selectedItem.longitude,
        pickupInstructions: selectedItem.pickupInstructions,
        recipientId: currentUser.uid,
        recipientName: userData.name || undefined,
        status: "pending_volunteer_assignment",
        requestedAt: Timestamp.now(),
      };
      await addDoc(collection(db, "food_delivery_requests"), deliveryRequestData);

      // 2. Update the original food post
      const itemRef = doc(db, "food_donations", selectedItem.id);
      await updateDoc(itemRef, {
        status: "delivery_requested",
        requestedByUid: currentUser.uid,
        claimType: "volunteer-delivery",
        requestedAt: Timestamp.now(), // Update requestedAt on the food post as well
      });

      setFoodItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id
            ? { ...item, status: "delivery_requested", requestedByUid: currentUser.uid, claimType: "volunteer-delivery", requestedAt: Timestamp.now() }
            : item
        ).filter(item => item.status === 'available' || item.status === 'requested') // Or refetch
      );
      toast({ title: "Delivery Requested!", description: `Volunteers have been notified about your request for ${selectedItem.foodType}.` });
      setIsRequestDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error requesting volunteer delivery:", err);
      toast({ title: "Delivery Request Failed", description: err.message || "Could not submit your delivery request.", variant: "destructive" });
    } finally {
      setIsSubmittingRequest(false);
    }
  };


  const openGoogleMaps = (item: FoodPost) => {
    let mapsUrl = `https://www.google.com/maps/search/?api=1&query=`;
    if (item.latitude && item.longitude) {
      mapsUrl += `${item.latitude},${item.longitude}`;
    } else {
      mapsUrl += encodeURIComponent(item.location);
    }
    window.open(mapsUrl, '_blank');
  };

  const getStatusBadgeVariant = (status: FoodPost["status"]) => {
    switch (status) {
      case "available": return "default"; // Or a specific "available" color
      case "requested": return "secondary"; // General interest
      case "claimed_by_recipient": return "outline"; // e.g. Yellowish
      case "delivery_requested": return "outline"; // e.g. Bluish
      case "volunteer_assigned": return "outline"; // e.g. Purplish
      case "fulfilled": return "default"; // e.g. Greenish
      case "expired": return "destructive";
      default: return "secondary";
    }
  };
  
  const getStatusText = (status: FoodPost["status"]) => {
     switch (status) {
      case "available": return "Available";
      case "requested": return "Requested";
      case "claimed_by_recipient": return "Claimed (Self Pickup)";
      case "delivery_requested": return "Delivery Requested";
      case "volunteer_assigned": return "Volunteer Assigned";
      case "fulfilled": return "Fulfilled";
      case "expired": return "Expired";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

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
                 <div className="absolute top-2 right-2">
                    <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs px-2 py-1">
                       {getStatusText(item.status)}
                    </Badge>
                  </div>
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
                  {item.latitude && item.longitude && <span className="ml-1 text-xs text-muted-foreground">(Precise location available)</span>}
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
                  onClick={() => handleOpenRequestDialog(item)}
                  disabled={ (item.status !== 'available' && item.status !== 'requested') || !currentUser || userData?.role !== 'recipient'}
                >
                   {(item.status === 'available' || item.status === 'requested') ? (
                    <>
                      <Handshake className="mr-2 h-4 w-4" /> Request Food
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
                Request Options: {selectedItem.foodType}
              </DialogTitle>
              <DialogDescription>
                Choose how you would like to receive this item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p><strong>Food Type:</strong> {selectedItem.foodType}</p>
              <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
              <p><strong>Donor:</strong> {selectedItem.donorName || "Anonymous Donor"}</p>
              <p><strong>Pickup Location:</strong> {selectedItem.location}</p>
              {selectedItem.latitude && selectedItem.longitude && (
                <p className="text-sm text-muted-foreground">
                  Exact coordinates are available for mapping.
                </p>
              )}
              {selectedItem.pickupInstructions && (
                <p><strong>Pickup Instructions:</strong> {selectedItem.pickupInstructions}</p>
              )}
              {selectedItem.expiryDate && (
                <p><strong>Expires by:</strong> {format(selectedItem.expiryDate.toDate(), "PPP")}</p>
              )}
              {selectedItem.postedAt && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Posted: {format(selectedItem.postedAt.toDate(), "PPP p")}
                  </p>
              )}
               <Button variant="outline" onClick={() => openGoogleMaps(selectedItem)} className="w-full mt-2">
                <MapPin className="mr-2 h-4 w-4" /> View Pickup Location on Map
              </Button>
            </div>
            <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
               <Button 
                type="button" 
                variant="outline"
                onClick={handleRequestVolunteerDelivery} 
                disabled={isSubmittingRequest || (selectedItem.status !== 'available' && selectedItem.status !== 'requested') || !currentUser || userData?.role !== 'recipient'}
                className="w-full sm:w-auto"
              >
                {isSubmittingRequest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bike className="mr-2 h-4 w-4" /> // Icon for volunteer delivery
                )}
                Request Volunteer Delivery
              </Button>
              <Button 
                type="button" 
                onClick={handleSelfPickup} 
                disabled={isSubmittingRequest || (selectedItem.status !== 'available' && selectedItem.status !== 'requested') || !currentUser || userData?.role !== 'recipient'}
                className="w-full sm:w-auto"
              >
                {isSubmittingRequest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                I'll Pick It Up Myself
              </Button>
            </DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="ghost" className="mt-4 w-full">
                  Cancel
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
