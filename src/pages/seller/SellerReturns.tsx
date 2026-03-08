import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSeller } from "@/contexts/SellerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Search, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatIQD } from "@/lib/currency";
import { useSeller } from "@/contexts/SellerContext";

interface ReturnRequest {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

export default function SellerReturns() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [responseNote, setResponseNote] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReturns(data as unknown as ReturnRequest[]);
      }
      setLoading(false);
    };
    fetchReturns();
  }, []);

  const filtered = returns.filter((r) => {
    const matchesSearch = r.reason.toLowerCase().includes(search.toLowerCase());
    if (statusFilter !== "all") return matchesSearch && r.status === statusFilter;
    return matchesSearch;
  });

  const statusCounts = {
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
    disputed: returns.filter((r) => r.status === "disputed").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case "approved": return <Badge className="bg-success/20 text-success border-success/30 gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      case "disputed": return <Badge className="bg-warning/20 text-warning border-warning/30 gap-1"><AlertTriangle className="w-3 h-3" />Disputed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-muted-foreground">Manage return requests and refunds</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{statusCounts.pending}</p><p className="text-xs text-muted-foreground">Pending Review</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{statusCounts.approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{statusCounts.disputed}</p><p className="text-xs text-muted-foreground">Disputed</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{statusCounts.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search returns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Returns</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Returns List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading returns...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No return requests found</p>
              <p className="text-xs text-muted-foreground mt-1">Return requests from buyers will appear here</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Return ID</th>
                  <th className="text-left p-3 font-medium">Reason</th>
                  <th className="text-right p-3 font-medium">Refund Amount</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Date</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ret) => (
                  <tr key={ret.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{ret.id.slice(0, 8)}...</td>
                    <td className="p-3">{ret.reason}</td>
                    <td className="p-3 text-right font-medium">{formatIQD(convertToIQD(Number(ret.refund_amount)))}</td>
                    <td className="p-3 text-center">{getStatusBadge(ret.status)}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(ret.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedReturn(ret)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Return Request</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium">{selectedReturn.reason}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Refund Amount</Label>
                <p className="font-medium">{formatIQD(convertToIQD(Number(selectedReturn.refund_amount)))}</p>
              </div>
              <div>
                <Label>Response Note</Label>
                <Textarea value={responseNote} onChange={(e) => setResponseNote(e.target.value)} placeholder="Add a note..." />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { toast({ title: "Return approved" }); setSelectedReturn(null); }}>Approve</Button>
                <Button variant="outline" className="flex-1" onClick={() => { toast({ title: "Return disputed" }); setSelectedReturn(null); }}>Dispute</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { toast({ title: "Return rejected" }); setSelectedReturn(null); }}>Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
