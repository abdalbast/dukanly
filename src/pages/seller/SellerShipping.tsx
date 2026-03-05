import { useState } from "react";
import { useSeller } from "@/contexts/SellerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Truck, Package, MapPin, Clock, Search } from "lucide-react";
import { formatIQD } from "@/lib/currency";

const REGIONS = [
  { name: "Erbil", standardRate: 5000, expressRate: 10000, standardDays: "2-3", expressDays: "1" },
  { name: "Sulaymaniyah", standardRate: 6500, expressRate: 12000, standardDays: "3-4", expressDays: "1-2" },
  { name: "Duhok", standardRate: 6500, expressRate: 12000, standardDays: "3-4", expressDays: "1-2" },
  { name: "Kirkuk", standardRate: 7500, expressRate: 14000, standardDays: "4-5", expressDays: "2" },
  { name: "Baghdad", standardRate: 10000, expressRate: 18000, standardDays: "5-7", expressDays: "2-3" },
  { name: "Other Iraq", standardRate: 12000, expressRate: 22000, standardDays: "7-10", expressDays: "3-5" },
];

export default function SellerShipping() {
  const { orders } = useSeller();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [handlingTime, setHandlingTime] = useState("1");

  // Extract shipment-relevant orders
  const shippableOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "pending") return matchesSearch && o.fulfillmentStatus === "unfulfilled";
    if (statusFilter === "shipped") return matchesSearch && o.status === "shipped";
    if (statusFilter === "delivered") return matchesSearch && o.status === "delivered";
    return matchesSearch;
  });

  const handleSaveTemplates = () => {
    toast({ title: "Shipping settings saved", description: "Your shipping templates have been updated." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shipping</h1>
        <p className="text-muted-foreground">Manage shipments, tracking, and delivery templates</p>
      </div>

      <Tabs defaultValue="shipments">
        <TabsList>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="templates">Shipping Templates</TabsTrigger>
          <TabsTrigger value="calculator">Delivery Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by order #..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Awaiting Shipment</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Order</th>
                    <th className="text-left p-3 font-medium">Items</th>
                    <th className="text-left p-3 font-medium">Destination</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Tracking</th>
                    <th className="text-right p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shippableOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{order.orderNumber}</td>
                      <td className="p-3">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                      <td className="p-3 text-muted-foreground">{order.shippingAddress.city || "—"}</td>
                      <td className="p-3 text-center">
                        <Badge variant={order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"}>
                          {order.fulfillmentStatus}
                        </Badge>
                      </td>
                      <td className="p-3">{order.trackingNumber || "—"}</td>
                      <td className="p-3 text-right text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {shippableOrders.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No shipments found</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rates by Region</CardTitle>
              <CardDescription>Configure delivery rates and estimated times for each region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Default Handling Time</Label>
                <Select value={handlingTime} onValueChange={setHandlingTime}>
                  <SelectTrigger className="w-40 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Region</th>
                    <th className="text-right p-3 font-medium">Standard Rate</th>
                    <th className="text-center p-3 font-medium">Standard Days</th>
                    <th className="text-right p-3 font-medium">Express Rate</th>
                    <th className="text-center p-3 font-medium">Express Days</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((r) => (
                    <tr key={r.name} className="border-b">
                      <td className="p-3 font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{r.name}</td>
                      <td className="p-3 text-right">{formatIQD(r.standardRate)}</td>
                      <td className="p-3 text-center text-muted-foreground">{r.standardDays} days</td>
                      <td className="p-3 text-right">{formatIQD(r.expressRate)}</td>
                      <td className="p-3 text-center text-muted-foreground">{r.expressDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveTemplates}>Save Templates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Promise Calculator</CardTitle>
              <CardDescription>Estimate delivery time based on region and handling time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REGIONS.map((r) => (
                  <div key={r.name} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">{r.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Standard</span>
                        <span>{parseInt(handlingTime) + parseInt(r.standardDays)} - {parseInt(handlingTime) + parseInt(r.standardDays.split("-")[1] || r.standardDays)} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Express</span>
                        <span>{parseInt(handlingTime) + parseInt(r.expressDays)} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
