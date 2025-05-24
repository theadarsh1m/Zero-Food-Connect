import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// This would be a client component if using react-hook-form, etc.
// For now, keeping it simple server component structure with placeholder form elements.

export default function DonatePage() {
  // const [date, setDate] = React.useState<Date>() // For client component

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
            Your contribution helps reduce waste and feed communities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="foodType">Food Type</Label>
              <Input id="foodType" placeholder="e.g., Fresh Produce, Cooked Meals" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" placeholder="e.g., 5 kg, 10 meals, 2 boxes" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Pickup Location</Label>
            <Input id="location" placeholder="Full address or general area" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date/Window</Label>
            {/* Placeholder for a real date picker. For a client component, you'd use state. */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    // !date && "text-muted-foreground" // if 'date' state was used
                    "text-muted-foreground" // static placeholder state
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {/* {date ? format(date, "PPP") : <span>Pick a date</span>} */}
                  <span>Pick a date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  // selected={date}
                  // onSelect={setDate} // if 'date' state was used
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupInstructions">Pickup Instructions (Optional)</Label>
            <Textarea id="pickupInstructions" placeholder="e.g., Contact John at 555-1234 upon arrival. Food is in the lobby fridge." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodImage">Upload Image (Optional)</Label>
            <Input id="foodImage" type="file" />
            <p className="text-xs text-muted-foreground">A picture can help recipients understand the donation better.</p>
          </div>

          <Button type="submit" className="w-full">Post Donation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
