
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, PackagePlus, Loader2, UploadCloud, MapPinIcon, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { FoodPost } from "@/types";
import Image from "next/image";

export default function DonatePage() {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();

  const [foodType, setFoodType] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [location, setLocation] = React.useState(""); // Textual location
  const [currentLocationCoords, setCurrentLocationCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [pickupInstructions, setPickupInstructions] = React.useState("");
  const [foodImageFile, setFoodImageFile] = React.useState<File | null>(null);
  const [foodImagePreview, setFoodImagePreview] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFoodImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFoodImageFile(null);
      setFoodImagePreview(null);
    }
  };

  const resetForm = () => {
    setFoodType("");
    setQuantity("");
    setLocation("");
    setCurrentLocationCoords(null);
    setSelectedDate(undefined);
    setPickupInstructions("");
    setFoodImageFile(null);
    setFoodImagePreview(null);
    const fileInput = document.getElementById('foodImage') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Location Fetched",
          description: "Your current location coordinates have been set.",
        });
        // Optionally, you could try to reverse geocode to fill the 'location' text input
        // For now, we inform the user and they can still add textual details.
        // setLocation(`Current Location (Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)})`);
        setIsFetchingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: error.message || "Could not fetch your location.",
          variant: "destructive",
        });
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || userData?.role !== 'donor') {
      toast({ title: "Access Denied", description: "You must be logged in as a donor to post donations.", variant: "destructive" });
      return;
    }
    if (!foodType || !quantity || !location || !selectedDate) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields (Food Type, Quantity, Pickup Location, Expiry Date).", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    let imageUrl: string | undefined = undefined;
    let imagePath: string | undefined = undefined;

    try {
      if (foodImageFile) {
        const uniqueFileName = `${Date.now()}-${foodImageFile.name}`;
        const storagePath = `food_donations_images/${currentUser.uid}/${uniqueFileName}`;
        const imageRef = storageRef(storage, storagePath);
        
        const uploadResult = await uploadBytes(imageRef, foodImageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        imagePath = uploadResult.ref.fullPath;
      }

      const donationData: FoodPost = {
        donorId: currentUser.uid,
        donorName: userData?.name || "Anonymous Donor",
        foodType,
        quantity,
        location, // Textual location
        ...(currentLocationCoords && { 
          latitude: currentLocationCoords.lat,
          longitude: currentLocationCoords.lng 
        }),
        expiryDate: Timestamp.fromDate(selectedDate),
        postedAt: Timestamp.now(),
        status: "available",
        ...(pickupInstructions && { pickupInstructions }),
        ...(imageUrl && { imageUrl }),
        ...(imagePath && { imagePath }),
      };

      await addDoc(collection(db, "food_donations"), donationData);

      toast({ title: "Donation Posted!", description: "Your food donation has been successfully listed." });
      resetForm();
    } catch (error: any) {
      console.error("Error posting donation:", error);
      toast({ 
        title: "Post Failed", 
        description: error.message || "Could not post your donation. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donate Surplus Food</h1>
        <p className="text-muted-foreground">
          Share your excess food with those in need. Fill out the details below.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-primary" />
            New Food Donation
          </CardTitle>
          <CardDescription>
            Your contribution helps reduce waste and feed communities. All fields marked * are required.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type *</Label>
                <Input id="foodType" placeholder="e.g., Fresh Produce, Cooked Meals" value={foodType} onChange={(e) => setFoodType(e.target.value)} disabled={isLoading || isFetchingLocation} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" placeholder="e.g., 5 kg, 10 meals, 2 boxes" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={isLoading || isFetchingLocation} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Pickup Location (Address/Description) *</Label>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <Input 
                  id="location" 
                  placeholder="Full address or general area" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  disabled={isLoading || isFetchingLocation} 
                  required 
                  className="flex-grow"
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetCurrentLocation} 
                disabled={isLoading || isFetchingLocation}
                className="w-full mt-2"
              >
                {isFetchingLocation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="mr-2 h-4 w-4" />
                )}
                Use My Current Location
              </Button>
              {currentLocationCoords && (
                <p className="text-xs text-muted-foreground">
                  Coordinates set: Lat: {currentLocationCoords.lat.toFixed(4)}, Lng: {currentLocationCoords.lng.toFixed(4)}. 
                  Please also provide a textual address/description.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date/Window *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={isLoading || isFetchingLocation}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || isLoading || isFetchingLocation
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select the date by which the food should be used or picked up.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupInstructions">Pickup Instructions (Optional)</Label>
              <Textarea id="pickupInstructions" placeholder="e.g., Contact John at 555-1234 upon arrival. Food is in the lobby fridge." value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)} disabled={isLoading || isFetchingLocation} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodImage">Upload Image (Optional)</Label>
              <Input id="foodImage" type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading || isFetchingLocation} />
              {foodImagePreview && (
                <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                   <Image src={foodImagePreview} alt="Food image preview" layout="fill" objectFit="cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">A picture can help recipients understand the donation better.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isFetchingLocation}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Donation...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Post Donation
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
