import { useState, useEffect, useMemo } from "react";
import { useSeller } from "@/contexts/SellerContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Package, RotateCcw, Banknote, Calendar, Loader2 } from "lucide-react";
import { formatIQD } from "@/lib/currency";

interface ReturnRow {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  created_at: string;
}

interface LedgerRow {
  id: string;
  type: string;
  amount: number;
  balance_after: number | null;
  description: string | null;
  order_id: string | null;
  currency_code: string;
  created_at: string;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escCsv(val: string | number | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function SellerReports() {
  const { orders, products, sellerId } = useSeller();
  const { toast } = useToast();

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("return_requests")
        .select("id, order_id, reason, status, refund_amount, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ledger_transactions")
        .select("id, type, amount, balance_after, description, order_id, currency_code, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false }),
    ]).then(([retRes, ledRes]) => {
      if (retRes.data) setReturns(retRes.data as ReturnRow[]);
      if (ledRes.data) setLedger(ledRes.data as LedgerRow[]);
      setLoading(false);
    });
  }, [sellerId]);

  // Date-filtered data
  const filteredOrders = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const filteredReturns = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    return returns.filter((r) => {
      const d = new Date(r.created_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [returns, dateFrom, dateTo]);

  const filteredLedger = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
    return ledger.filter((l) => {
      const d = new Date(l.created_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [ledger, dateFrom, dateTo]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold && p.status === "active").length;

  const exportSales = () => {
    const rows = ["Order Number,Date,Items,Subtotal (IQD),Shipping (IQD),Total (IQD),Payment Status,Fulfillment Status"];
    filteredOrders.forEach((o) => {
      rows.push([
        escCsv(o.orderNumber),
        new Date(o.createdAt).toLocaleDateString(),
        o.items.length,
        o.subtotal,
        o.shippingCost,
        o.total,
        o.paymentStatus,
        o.fulfillmentStatus,
      ].join(","));
    });
    downloadCsv(rows.join("\n"), `sales-report-${dateFrom}-to-${dateTo}.csv`);
    toast({ title: "Report exported", description: `Sales report with ${filteredOrders.length} orders downloaded.` });
  };

  const exportInventory = () => {
    const rows = ["Product,SKU,Stock,Status,Price (IQD)"];
    products.forEach((p) => {
      rows.push([escCsv(p.title), escCsv(p.sku), p.stock, p.status, p.price].join(","));
    });
    downloadCsv(rows.join("\n"), `inventory-report-${today}.csv`);
    toast({ title: "Report exported", description: `Inventory report with ${products.length} products downloaded.` });
  };

  const exportReturns = () => {
    const rows = ["Return ID,Order ID,Reason,Status,Refund Amount (IQD),Date"];
    filteredReturns.forEach((r) => {
      rows.push([
        r.id,
        r.order_id,
        escCsv(r.reason),
        r.status,
        r.refund_amount ?? 0,
        new Date(r.created_at).toLocaleDateString(),
      ].join(","));
    });
    downloadCsv(rows.join("\n"), `returns-report-${dateFrom}-to-${dateTo}.csv`);
    toast({ title: "Report exported", description: `Returns report with ${filteredReturns.length} records downloaded.` });
  };

  const exportFinancial = () => {
    const rows = ["Transaction ID,Date,Type,Description,Amount (IQD),Balance After (IQD),Order ID"];
    filteredLedger.forEach((l) => {
      rows.push([
        l.id,
        new Date(l.created_at).toLocaleDateString(),
        l.type,
        escCsv(l.description),
        l.amount,
        l.balance_after ?? "",
        l.order_id ?? "",
      ].join(","));
    });
    downloadCsv(rows.join("\n"), `financial-report-${dateFrom}-to-${dateTo}.csv`);
    toast({ title: "Report exported", description: `Financial report with ${filteredLedger.length} transactions downloaded.` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and download business reports</p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom(thirtyDaysAgo);
                setDateTo(today);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="returns">Returns ({filteredReturns.length})</TabsTrigger>
          <TabsTrigger value="financial">Financial ({filteredLedger.length})</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-success mb-2" />
                <p className="text-2xl font-bold">{formatIQD(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Revenue ({filteredOrders.length} orders)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <FileText className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
                <p className="text-xs text-muted-foreground">Orders in range</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-info mb-2" />
                <p className="text-2xl font-bold">
                  {formatIQD(filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={exportSales} disabled={filteredOrders.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Sales Report ({filteredOrders.length})
            </Button>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <Package className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{activeProducts}</p>
                <p className="text-xs text-muted-foreground">Active Products</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Package className="w-8 h-8 text-warning mb-2" />
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-xs text-muted-foreground">Low Stock Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Package className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">Total SKUs</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={exportInventory} disabled={products.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Inventory Report ({products.length})
            </Button>
          </div>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <RotateCcw className="w-8 h-8 text-warning mb-2" />
                <p className="text-2xl font-bold">{filteredReturns.length}</p>
                <p className="text-xs text-muted-foreground">Return Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <RotateCcw className="w-8 h-8 text-destructive mb-2" />
                <p className="text-2xl font-bold">
                  {filteredReturns.filter((r) => r.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-success mb-2" />
                <p className="text-2xl font-bold">
                  {formatIQD(filteredReturns.reduce((s, r) => s + (r.refund_amount ?? 0), 0))}
                </p>
                <p className="text-xs text-muted-foreground">Total Refund Amount</p>
              </CardContent>
            </Card>
          </div>
          {filteredReturns.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No return requests in this date range</p>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-end">
            <Button onClick={exportReturns} disabled={filteredReturns.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Returns Report ({filteredReturns.length})
            </Button>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-success mb-2" />
                <p className="text-2xl font-bold">{filteredLedger.length}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">
                  {formatIQD(filteredLedger.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Banknote className="w-8 h-8 text-destructive mb-2" />
                <p className="text-2xl font-bold">
                  {formatIQD(Math.abs(filteredLedger.filter((l) => l.amount < 0).reduce((s, l) => s + l.amount, 0)))}
                </p>
                <p className="text-xs text-muted-foreground">Debits</p>
              </CardContent>
            </Card>
          </div>
          {filteredLedger.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Banknote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No ledger transactions in this date range</p>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-end">
            <Button onClick={exportFinancial} disabled={filteredLedger.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Financial Report ({filteredLedger.length})
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
