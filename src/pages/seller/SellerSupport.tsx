import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { HeadphonesIcon, Plus, Search, Clock, CheckCircle, MessageSquare, ExternalLink } from "lucide-react";

interface SupportCase {
  id: string;
  subject: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "orders", label: "Order Issue" },
  { value: "payments", label: "Payment / Payout" },
  { value: "listings", label: "Product Listing" },
  { value: "account", label: "Account & Verification" },
  { value: "shipping", label: "Shipping Problem" },
  { value: "policy", label: "Policy Dispute" },
];

export default function SellerSupport() {
  const { toast } = useToast();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCases = async () => {
    const { data } = await supabase
      .from("support_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCases(data as unknown as SupportCase[]);
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const handleCreateCase = async () => {
    if (!subject) return;
    const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", (await supabase.auth.getUser()).data.user?.id).single();
    if (!seller) return;

    const { error } = await supabase.from("support_cases").insert({
      seller_id: seller.id,
      subject,
      description,
      category,
    });

    if (!error) {
      toast({ title: "Case created", description: "Your support case has been submitted." });
      setNewCaseOpen(false);
      setSubject("");
      setDescription("");
      fetchCases();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filtered = cases.filter((c) => {
    const matchesSearch = c.subject.toLowerCase().includes(search.toLowerCase());
    if (statusFilter !== "all") return matchesSearch && c.status === statusFilter;
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Open</Badge>;
      case "in_progress": return <Badge className="bg-info/20 text-info border-info/30 gap-1"><MessageSquare className="w-3 h-3" />In Progress</Badge>;
      case "resolved": return <Badge className="bg-success/20 text-success border-success/30 gap-1"><CheckCircle className="w-3 h-3" />Resolved</Badge>;
      case "closed": return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Get help and manage support cases</p>
        </div>
        <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Case</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Support Case</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your issue in detail..." rows={4} />
              </div>
              <Button onClick={handleCreateCase} disabled={!subject} className="w-full">Submit Case</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Help Centre Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Seller Guidelines", desc: "Product listing rules and policies", icon: ExternalLink },
          { title: "Shipping FAQ", desc: "Delivery regions and packaging", icon: ExternalLink },
          { title: "Payment Help", desc: "Payout schedule and fee structure", icon: ExternalLink },
        ].map((link) => (
          <Card key={link.title} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <link.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading cases...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <HeadphonesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No support cases</p>
              <p className="text-xs text-muted-foreground mt-1">Create a new case if you need help</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Subject</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Created</th>
                  <th className="text-right p-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.subject}</td>
                    <td className="p-3 text-muted-foreground capitalize">{c.category}</td>
                    <td className="p-3 text-center">{getStatusBadge(c.status)}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
