import { useState } from "react";
import { useSeller } from "@/contexts/SellerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Package, RotateCcw, DollarSign, Calendar } from "lucide-react";
import { formatIQD, convertToIQD } from "@/lib/currency";

export default function SellerReports() {
  const { orders, products, analytics } = useSeller();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const exportReport = (type: string) => {
    let csv = "";
    if (type === "sales") {
      csv = "Order Number,Date,Items,Total (IQD),Status\n";
      orders.forEach((o) => {
        csv += `${o.orderNumber},${new Date(o.createdAt).toLocaleDateString()},${o.items.length},${convertToIQD(o.total)},${o.status}\n`;
      });
    } else if (type === "inventory") {
      csv = "Product,SKU,Stock,Status,Price (IQD)\n";
      products.forEach((p) => {
        csv += `"${p.title}",${p.sku},${p.stock},${p.status},${convertToIQD(p.price)}\n`;
      });
    } else if (type === "returns") {
      csv = "No return data yet\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: `${type} report downloaded as CSV.` });
  };

  const totalRevenue = convertToIQD(analytics.totalRevenue);
  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold && p.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and download business reports</p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div>
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Apply Range</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <DollarSign className="w-8 h-8 text-success mb-2" />
                <p className="text-2xl font-bold">{formatIQD(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <FileText className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <DollarSign className="w-8 h-8 text-info mb-2" />
                <p className="text-2xl font-bold">{formatIQD(orders.length > 0 ? totalRevenue / orders.length : 0)}</p>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => exportReport("sales")}><Download className="w-4 h-4 mr-2" />Export Sales Report</Button>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><Package className="w-8 h-8 text-primary mb-2" /><p className="text-2xl font-bold">{activeProducts}</p><p className="text-xs text-muted-foreground">Active Products</p></CardContent></Card>
            <Card><CardContent className="p-4"><Package className="w-8 h-8 text-warning mb-2" /><p className="text-2xl font-bold">{lowStockCount}</p><p className="text-xs text-muted-foreground">Low Stock Items</p></CardContent></Card>
            <Card><CardContent className="p-4"><Package className="w-8 h-8 text-muted-foreground mb-2" /><p className="text-2xl font-bold">{products.length}</p><p className="text-xs text-muted-foreground">Total SKUs</p></CardContent></Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => exportReport("inventory")}><Download className="w-4 h-4 mr-2" />Export Inventory Report</Button>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Returns report will show data once return requests are processed</p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={() => exportReport("returns")} variant="outline"><Download className="w-4 h-4 mr-2" />Export Returns Report</Button>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Financial export includes all ledger transactions</p>
              <p className="text-xs text-muted-foreground mt-1">Go to Payments → Transactions for detailed ledger view with CSV export</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
