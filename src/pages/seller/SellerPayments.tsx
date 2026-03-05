import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowDownLeft, ArrowUpRight, Search, Download, Calendar, CreditCard, Clock } from "lucide-react";
import { formatIQD } from "@/lib/currency";

interface LedgerTransaction {
  id: string;
  type: string;
  amount: number;
  currency_code: string;
  description: string | null;
  balance_after: number;
  created_at: string;
  order_id: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  order_sale: "Order Sale",
  commission_fee: "Commission Fee",
  shipping_charge: "Shipping Charge",
  refund: "Refund",
  adjustment: "Adjustment",
  payout_transfer: "Payout Transfer",
  payment_processing_fee: "Processing Fee",
};

export default function SellerPayments() {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLedger = async () => {
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setTransactions(data as unknown as LedgerTransaction[]);
      }
      setLoading(false);
    };
    fetchLedger();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch = (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.order_id || "").includes(search);
    if (typeFilter !== "all") return matchesSearch && t.type === typeFilter;
    return matchesSearch;
  });

  // Calculate balances
  const totalEarnings = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + Number(t.amount), 0);
  const totalFees = transactions.filter((t) => t.amount < 0 && t.type !== "payout_transfer").reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
  const totalPayouts = transactions.filter((t) => t.type === "payout_transfer").reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
  const availableBalance = totalEarnings - totalFees - totalPayouts;

  const exportCSV = () => {
    const headers = "Date,Type,Description,Amount,Balance\n";
    const rows = filtered.map((t) =>
      `${new Date(t.created_at).toISOString()},${t.type},${(t.description || "").replace(/,/g, ";")},${t.amount},${t.balance_after}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Track your earnings, fees, and payouts</p>
      </div>

      <Tabs defaultValue="statement">
        <TabsList>
          <TabsTrigger value="statement">Statement</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="statement" className="space-y-4 mt-4">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                    <p className="text-xl font-bold">{formatIQD(availableBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="text-xl font-bold">{formatIQD(totalEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Fees</p>
                    <p className="text-xl font-bold">{formatIQD(totalFees)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-8 h-8 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Payouts</p>
                    <p className="text-xl font-bold">{formatIQD(totalPayouts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Payout */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Next Payout</p>
                  <p className="text-sm text-muted-foreground">Estimated: {new Date(Date.now() + 7 * 86400000).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-lg font-bold">{formatIQD(availableBalance)}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by description or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="order_sale">Order Sale</SelectItem>
                <SelectItem value="commission_fee">Commission Fee</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="payout_transfer">Payout Transfer</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>

          {/* Ledger Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-xs text-muted-foreground mt-1">Transactions will appear here as you receive orders and process payments</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-left p-3 font-medium">Order</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                      <th className="text-right p-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="p-3"><Badge variant="outline">{TYPE_LABELS[t.type] || t.type}</Badge></td>
                        <td className="p-3">{t.description || "—"}</td>
                        <td className="p-3 font-mono text-xs">{t.order_id ? t.order_id.slice(0, 8) + "..." : "—"}</td>
                        <td className={`p-3 text-right font-medium ${Number(t.amount) >= 0 ? "text-success" : "text-destructive"}`}>
                          {Number(t.amount) >= 0 ? "+" : ""}{formatIQD(Number(t.amount))}
                        </td>
                        <td className="p-3 text-right">{formatIQD(Number(t.balance_after))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
