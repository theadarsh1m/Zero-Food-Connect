import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Handshake, Truck, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

// Mock data for history - this would be dynamic based on user role and fetched data
const mockHistory = {
  donations: [
    { id: "d1", type: "Cooked Meals", quantity: "20 meals", date: "2024-07-15", status: "Fulfilled", recipient: "City Soup Kitchen" },
    { id: "d2", type: "Fresh Produce", quantity: "15 kg", date: "2024-07-10", status: "Expired", recipient: "-" },
  ],
  received: [
    { id: "r1", type: "Bakery Items", quantity: "2 boxes", date: "2024-07-12", status: "Received", donor: "Maria's Cafe" },
  ],
  pickups: [
    { id: "p1", foodType: "Canned Goods", date: "2024-07-14", status: "Completed", from: "Local Supermarket", to: "North End Shelter" },
  ],
};

// This component would ideally determine the user's role and show relevant tabs.
// For this placeholder, we'll assume a user might have access to all (e.g. admin or for demo).
// Or, one could create separate views based on role.

export default function HistoryPage() {
  const userRole: "donor" | "recipient" | "volunteer" = "donor"; // Placeholder, fetch actual user role

  const renderHistoryItem = (item: any, type: 'donation' | 'received' | 'pickup') => (
    <Card key={item.id} className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base flex items-center">
            {type === 'donation' && <Package className="mr-2 h-5 w-5 text-primary" />}
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground">
          Review your past contributions and pickups.
        </p>
      </div>

      <Tabs defaultValue={userRole === "donor" ? "donations" : userRole === "recipient" ? "received" : "pickups"} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="donations" disabled={userRole !== 'donor' && userRole !== 'admin'}>My Donations</TabsTrigger>
          <TabsTrigger value="received" disabled={userRole !== 'recipient' && userRole !== 'admin'}>Items Received</TabsTrigger>
          <TabsTrigger value="pickups" disabled={userRole !== 'volunteer' && userRole !== 'admin'}>Pickups Fulfilled</TabsTrigger>
        </TabsList>
        <TabsContent value="donations" className="mt-6">
          {mockHistory.donations.length > 0 ? 
            mockHistory.donations.map(item => renderHistoryItem(item, 'donation')) : 
            <p className="text-muted-foreground text-center py-8">No donation history found.</p>
          }
        </TabsContent>
        <TabsContent value="received" className="mt-6">
          {mockHistory.received.length > 0 ?
            mockHistory.received.map(item => renderHistoryItem(item, 'received')) :
            <p className="text-muted-foreground text-center py-8">No received items history found.</p>
          }
        </TabsContent>
        <TabsContent value="pickups" className="mt-6">
         {mockHistory.pickups.length > 0 ?
            mockHistory.pickups.map(item => renderHistoryItem(item, 'pickup')) :
            <p className="text-muted-foreground text-center py-8">No pickup history found.</p>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
