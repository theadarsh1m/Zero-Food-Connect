import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, Users } from "lucide-react";

export default function DashboardPage() {
  // Placeholder data - replace with actual data fetching and aggregation
  const stats = [
    { title: "Meals Served", value: "1,250", icon: Package, color: "text-primary" },
    { title: "Kg of Food Saved", value: "340 kg", icon: BarChart3, color: "text-accent-foreground" }, // using accent here for variety
    { title: "Active Volunteers", value: "78", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impact Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of ZeroWaste Connect&apos;s collective impact.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display recent donations, requests, and fulfillments.
            For now, it&apos;s a placeholder for future development.
          </p>
          <div className="mt-4 p-4 border border-dashed rounded-lg h-64 flex items-center justify-center bg-muted/30">
             <p className="text-muted-foreground text-center">Chart or activity feed will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
