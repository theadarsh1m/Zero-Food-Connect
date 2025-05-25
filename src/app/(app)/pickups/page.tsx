
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MapPin, Package, User, Clock, CheckCircle2, Truck, Loader2, AlertTriangle, Search, Info, CalendarDays, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import type { FoodDeliveryRequest } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // For potential redirects or navigation

export default function VolunteerPickupsPage() {
  const [pickupRequests, setPickupRequests] = React.useState<FoodDeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAccepting, setIsAccepting] = React.useState<string | null>(null); 
  
  const [selectedRequestDetails, setSelectedRequestDetails] = React.useState<FoodDeliveryRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchPickupRequests = async () => {
    if (!currentUser || userData?.role !== 'volunteer') {
      setError("You must be logged in as a volunteer to view pickup requests.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "food_delivery_requests"),
        where("status", "==", "pending_volunteer_assignment"),
        orderBy("requestedAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FoodDeliveryRequest[];
      setPickupRequests(fetchedRequests);
    } catch (err: any) {
      console.error("Error fetching pickup requests:", err);
      setError("Failed to load pickup requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPickupRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userData]);

  const handleAcceptPickup = async (request: FoodDeliveryRequest) => {
    if (!currentUser || userData?.role !== 'volunteer' || !request.id) {
      toast({ title: "Action Not Allowed", description: "Unable to accept this pickup.", variant: "destructive" });
      return;
    }
    if (request.status !== 'pending_volunteer_assignment') {
      toast({ title: "Already Handled", description: "This pickup request is no longer pending.", variant: "default" });
      fetchPickupRequests(); // Re-fetch to update list
      return;
    }

    setIsAccepting(request.id);
    try {
      const requestRef = doc(db, "food_delivery_requests", request.id);
      await updateDoc(requestRef, {
        status: "assigned_to_volunteer",
        assignedVolunteerId: currentUser.uid,
        assignedVolunteerName: userData.name || "Volunteer",
        assignedAt: Timestamp.now(),
      });

      const donationRef = doc(db, "food_donations", request.donationId);
      await updateDoc(donationRef, {
        status: "volunteer_assigned", 
      });

      setPickupRequests(prevRequests => prevRequests.filter(r => r.id !== request.id));
      toast({ title: "Pickup Accepted!", description: `You have accepted the pickup for ${request.foodType}. Details shown below.` });
      
      // Set details for the modal and open it
      const fullRequestDetails = {
        ...request,
        status: "assigned_to_volunteer" as FoodDeliveryRequest["status"], // type assertion
        assignedVolunteerId: currentUser.uid,
        assignedVolunteerName: userData.name || "Volunteer",
        assignedAt: Timestamp.now(),
      };
      setSelectedRequestDetails(fullRequestDetails);
      setIsDetailsModalOpen(true);

    } catch (err: any) {
      console.error("Error accepting pickup:", err);
      toast({ title: "Acceptance Failed", description: err.message || "Could not accept the pickup. Please try again.", variant: "destructive" });
    } finally {
      setIsAccepting(null);
    }
  };
  
  const openGoogleMaps = (item: FoodDeliveryRequest | null) => {
    if (!item) return;
    let mapsUrl = `https://www.google.com/maps/search/?api=1&query=`;
    if (item.pickupLatitude && item.pickupLongitude) {
      mapsUrl += `${item.pickupLatitude},${item.pickupLongitude}`;
    } else {
      mapsUrl += encodeURIComponent(item.pickupLocation);
    }
    window.open(mapsUrl, '_blank');
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Pickup Requests</h1>
        <p className="text-muted-foreground">
          Help deliver surplus food to those in need. Select a request to view details and accept.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg">Loading pickup requests...</p>
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-10 flex flex-col items-center text-destructive text-center">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h3>
            <p>{error}</p>
            {userData?.role !== 'volunteer' && (
              <Button onClick={() => router.push(`/${userData?.role || 'dashboard'}`)} className="mt-4">Go to My Dashboard</Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && pickupRequests.length === 0 && (
         <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Pending Pickup Requests</h3>
            <p className="text-muted-foreground">Thank you for your willingness to help! Check back soon for new requests.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && pickupRequests.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {pickupRequests.map((request) => (
            <Card key={request.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" /> {request.foodType}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant={request.status === "pending_volunteer_assignment" ? "default" : "secondary"} className="mt-1">
                        {request.status === "pending_volunteer_assignment" ? "Available for Pickup" : request.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" /> Requested: {format(request.requestedAt.toDate(), "PPp")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start text-sm">
                  <Package className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div><strong>Quantity:</strong> {request.quantity}</div>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div><strong>From (Donor):</strong> {request.donorName || 'Anonymous'} at {request.pickupLocation}</div>
                </div>
                 <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => openGoogleMaps(request)}>
                   View Pickup Map Preview
                 </Button>
                <div className="flex items-start text-sm">
                  <User className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div><strong>To (Recipient):</strong> {request.recipientName || 'Recipient'}</div>
                </div>
                {request.pickupInstructions && (
                    <p className="text-xs text-muted-foreground border-l-2 pl-2"><strong>Instructions:</strong> {request.pickupInstructions}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {request.status === "pending_volunteer_assignment" && (
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptPickup(request)}
                    disabled={isAccepting === request.id || !currentUser || userData?.role !== 'volunteer'}
                  >
                    {isAccepting === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" /> }
                     Accept Pickup
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedRequestDetails && (
        <Dialog open={isDetailsModalOpen} onOpenChange={(open) => {
          setIsDetailsModalOpen(open);
          if (!open) setSelectedRequestDetails(null);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Accepted Pickup: {selectedRequestDetails.foodType}
              </DialogTitle>
              <DialogDescription>
                You have accepted this delivery. Please coordinate with the donor and recipient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm max-h-[60vh] overflow-y-auto">
              <p><strong>Status:</strong> <Badge>{selectedRequestDetails.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge></p>
              <p><strong>Food Type:</strong> {selectedRequestDetails.foodType}</p>
              <p><strong>Quantity:</strong> {selectedRequestDetails.quantity}</p>
              
              <Card className="my-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4"/>Donor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <p><strong>Name:</strong> {selectedRequestDetails.donorName || "Anonymous Donor"}</p>
                    <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground"/> 
                        <strong>Pickup Location:</strong> {selectedRequestDetails.pickupLocation}
                    </p>
                    {selectedRequestDetails.pickupInstructions && (
                        <p><strong>Pickup Instructions:</strong> {selectedRequestDetails.pickupInstructions}</p>
                    )}
                    <Button variant="outline" onClick={() => openGoogleMaps(selectedRequestDetails)} className="w-full mt-2 text-xs">
                        <MapPin className="mr-2 h-3 w-3" /> View Pickup Location on Map
                    </Button>
                     {/* Placeholder for donor contact */}
                    {/* <p><Phone className="inline mr-1 h-4 w-4 text-muted-foreground"/> <strong>Contact:</strong> (Not Implemented)</p> */}
                </CardContent>
              </Card>

              <Card className="my-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4"/>Recipient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <p><strong>Name:</strong> {selectedRequestDetails.recipientName || "Recipient"}</p>
                     {/* Placeholder for recipient address & contact */}
                    {/* <p><MapPin className="inline mr-1 h-4 w-4 text-muted-foreground"/> <strong>Delivery Location:</strong> (Not Implemented)</p> */}
                    {/* <p><Phone className="inline mr-1 h-4 w-4 text-muted-foreground"/> <strong>Contact:</strong> (Not Implemented)</p> */}
                </CardContent>
              </Card>
              
              {selectedRequestDetails.requestedAt && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3"/> 
                    Requested: {format(selectedRequestDetails.requestedAt.toDate(), "PPP p")}
                </p>
              )}
              {selectedRequestDetails.assignedAt && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3"/> 
                    Accepted by you: {format(selectedRequestDetails.assignedAt.toDate(), "PPP p")}
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-end gap-2">
              {/* Placeholder buttons for further actions */}
              {/* <Button type="button" variant="outline" disabled>Mark as Picked Up</Button> */}
              {/* <Button type="button" disabled>Mark as Delivered</Button> */}
              <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
