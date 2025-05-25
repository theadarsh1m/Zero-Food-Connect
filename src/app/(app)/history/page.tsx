
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Handshake, Truck, CalendarDays, CheckCircle2, XCircle, Loader2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import type { FoodPost } from "@/types";
import { format } from "date-fns";
import Image from "next/image";

// Mock data for received and pickups - this would be dynamic based on user role and fetched data
const mockHistory = {
  received: [
    { id: "r1", type: "Bakery Items", quantity: "2 boxes", date: "2024-07-12", status: "Received", donor: "Maria's Cafe" },
  ],
  pickups: [
    { id: "p1", foodType: "Canned Goods", date: "2024-07-14", status: "Completed", from: "Local Supermarket", to: "North End Shelter" },
  ],
};


export default function HistoryPage() {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = React.useState<string>(userData?.role === "donor" ? "donations" : userData?.role === "recipient" ? "received" : userData?.role === "volunteer" ? "pickups" : "donations");
  
  const [donations, setDonations] = React.useState<FoodPost[]>([]);
  const [isLoadingDonations, setIsLoadingDonations] = React.useState(false);
  const [donationsError, setDonationsError] = React.useState<string | null>(null);

  // TODO: Add similar state and useEffect for 'received' and 'pickups' tabs

  React.useEffect(() => {
    if (activeTab === 'donations' && currentUser) {
      const fetchDonations = async () => {
        setIsLoadingDonations(true);
        setDonationsError(null);
        try {
          const q = query(
            collection(db, "food_donations"),
            where("donorId", "==", currentUser.uid),
            orderBy("postedAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedDonations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as FoodPost[];
          setDonations(fetchedDonations);
        } catch (error: any) {
          console.error("Error fetching donations:", error);
          setDonationsError("Failed to load your donations. Please try again.");
        } finally {
          setIsLoadingDonations(false);
        }
      };
      fetchDonations();
    }
  }, [currentUser, activeTab]);

  const renderDonationItem = (item: FoodPost) => (
    <Card key={item.id} className="mb-4 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5 text-primary" />
            {item.foodType}
          </CardTitle>
          <Badge 
            variant={item.status === "fulfilled" ? "default" : item.status === "expired" ? "destructive" : "secondary"}
            className={cn(
                item.status === "fulfilled" && "bg-green-600 text-white",
                item.status === "expired" && "bg-red-600 text-white",
                item.status === "available" && "bg-blue-500 text-white",
                item.status === "requested" && "bg-yellow-500 text-white"
            )}
          >
            {item.status === "fulfilled" || item.status === "available" ? <CheckCircle2 className="mr-1 h-3 w-3"/> : <XCircle className="mr-1 h-3 w-3" />}
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
         {item.postedAt && (
          <CardDescription className="flex items-center text-xs pt-1">
            <CalendarDays className="mr-1 h-3 w-3" /> Posted: {format(item.postedAt.toDate(), "PPP p")}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p><strong>Quantity:</strong> {item.quantity}</p>
        <p><strong>Location:</strong> {item.location}</p>
        {item.expiryDate && (
          <p className="flex items-center">
            <CalendarDays className="mr-1 h-3 w-3 text-destructive" /> 
            <strong>Expires by:</strong> {format(item.expiryDate.toDate(), "PPP")}
          </p>
        )}
        {item.pickupInstructions && <p><strong>Instructions:</strong> {item.pickupInstructions}</p>}
        {item.imageUrl && (
          <div className="mt-2">
            <p className="font-medium mb-1">Image:</p>
            <div className="relative w-full h-40 md:w-60 md:h-40 rounded border overflow-hidden">
              <Image src={item.imageUrl} alt={item.foodType} layout="fill" objectFit="cover" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderGenericHistoryItem = (item: any, type: 'received' | 'pickup') => (
    <Card key={item.id} className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base flex items-center">
            {type === 'received' && <Handshake className="mr-2 h-5 w-5 text-primary" />}
            {type === 'pickup' && <Truck className="mr-2 h-5 w-5 text-primary" />}
            {item.type || item.foodType}
          </CardTitle>
          <Badge variant={item.status.toLowerCase().includes("fulfill") || item.status.toLowerCase().includes("complete") || item.status.toLowerCase().includes("receive") ? "default" : "outline"}>
            {item.status.toLowerCase().includes("fulfill") || item.status.toLowerCase().includes("complete") || item.status.toLowerCase().includes("receive") ? <CheckCircle2 className="mr-1 h-3 w-3"/> : <XCircle className="mr-1 h-3 w-3" />}
            {item.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-xs pt-1">
          <CalendarDays className="mr-1 h-3 w-3" /> {item.date}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {item.quantity && <p><strong>Quantity:</strong> {item.quantity}</p>}
        {item.recipient && <p><strong>Recipient:</strong> {item.recipient}</p>}
        {item.donor && <p><strong>Donor:</strong> {item.donor}</p>}
        {item.from && <p><strong>From:</strong> {item.from}</p>}
        {item.to && <p><strong>To:</strong> {item.to}</p>}
      </CardContent>
    </Card>
  );


  const userActualRole = userData?.role;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground">
          Review your past contributions, received items, and pickups.
        </p>
      </div>

      <Tabs 
        defaultValue={userActualRole === "donor" ? "donations" : userActualRole === "recipient" ? "received" : userActualRole === "volunteer" ? "pickups" : "donations"} 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="donations" disabled={userActualRole !== 'donor' && userActualRole !== 'admin'}>My Donations</TabsTrigger>
          <TabsTrigger value="received" disabled={userActualRole !== 'recipient' && userActualRole !== 'admin'}>Items Received</TabsTrigger>
          <TabsTrigger value="pickups" disabled={userActualRole !== 'volunteer' && userActualRole !== 'admin'}>Pickups Fulfilled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="donations" className="mt-6">
          {isLoadingDonations && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading your donations...</p>
            </div>
          )}
          {!isLoadingDonations && donationsError && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="py-6 flex flex-col items-center text-destructive">
                <AlertTriangle className="w-10 h-10 mb-2" />
                <p className="font-semibold">Error</p>
                <p>{donationsError}</p>
              </CardContent>
            </Card>
          )}
          {!isLoadingDonations && !donationsError && donations.length === 0 && (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Donation History Found</h3>
                <p className="text-muted-foreground">You haven&apos;t made any donations yet.</p>
              </CardContent>
            </Card>
          )}
          {!isLoadingDonations && !donationsError && donations.length > 0 && 
            donations.map(item => renderDonationItem(item))
          }
        </TabsContent>

        <TabsContent value="received" className="mt-6">
          {/* Placeholder - Implement fetching for received items similarly */}
          {mockHistory.received.length > 0 ?
            mockHistory.received.map(item => renderGenericHistoryItem(item, 'received')) :
             <Card><CardContent className="py-12 text-muted-foreground text-center">No received items history found yet.</CardContent></Card>
          }
        </TabsContent>
        <TabsContent value="pickups" className="mt-6">
         {/* Placeholder - Implement fetching for pickups similarly */}
         {mockHistory.pickups.length > 0 ?
            mockHistory.pickups.map(item => renderGenericHistoryItem(item, 'pickup')) :
            <Card><CardContent className="py-12 text-muted-foreground text-center">No pickup history found yet.</CardContent></Card>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}

    