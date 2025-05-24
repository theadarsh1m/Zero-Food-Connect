import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, User, Clock, CheckCircle2, Truck } from "lucide-react";

// Mock data for pickup requests
const mockPickupRequests = [
  {
    id: "req1",
    foodType: "Fresh Vegetables",
    quantity: "Approx. 10 kg",
    donorLocation: "Downtown Community Center",
    recipientName: "City Soup Kitchen",
    recipientLocation: "12 Elm Street",
    status: "pending_pickup",
    postedTime: "2 hours ago"
  },
  {
    id: "req2",
    foodType: "Bakery Surplus",
    quantity: "3 boxes",
    donorLocation: "Maria's Cafe, 123 Main St",
    recipientName: "North End Shelter",
    recipientLocation: "45 Oak Avenue",
    status: "assigned_to_volunteer", // This request is already taken by another volunteer
    postedTime: "45 mins ago"
  },
  {
    id: "req3",
    foodType: "Canned Goods",
    quantity: "2 large bags",
    donorLocation: "Residential Address (details on acceptance)",
    recipientName: "Westside Food Bank",
    recipientLocation: "78 Pine Road",
    status: "pending_pickup",
    postedTime: "5 hours ago"
  }
];

export default function PickupsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Pickup Requests</h1>
        <p className="text-muted-foreground">
          Help deliver surplus food to those in need. Select a request to view details and accept.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {mockPickupRequests.map((request) => (
          <Card key={request.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" /> {request.foodType}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant={request.status === "pending_pickup" ? "default" : "secondary"} className="mt-1">
                      {request.status === "pending_pickup" ? "Available for Pickup" : "Assigned"}
                    </Badge>
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" /> {request.postedTime}
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
                <div><strong>From:</strong> {request.donorLocation}</div>
              </div>
              <div className="flex items-start text-sm">
                <User className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div><strong>To:</strong> {request.recipientName} ({request.recipientLocation})</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm">View Details</Button>
              {request.status === "pending_pickup" && (
                <Button size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Pickup
                </Button>
              )}
              {request.status === "assigned_to_volunteer" && (
                 <Button size="sm" disabled>Already Assigned</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      {mockPickupRequests.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Truck className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Pickup Requests Available</h3>
            <p className="text-muted-foreground">Thank you for your willingness to help! Check back soon for new requests.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
