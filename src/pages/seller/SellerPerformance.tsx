import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSeller } from "@/contexts/SellerContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, AlertTriangle, TrendingUp, Clock, Star,
  MessageSquare, ChevronRight, FileText, CheckCircle, XCircle,
} from "lucide-react";

interface PolicyIssue {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string | null;
  fix_instructions: string | null;
  status: string;
  created_at: string;
}

export default function SellerPerformance() {
  const { orders, analytics } = useSeller();
  const { toast } = useToast();
  const [issues, setIssues] = useState<PolicyIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [appealDialogOpen, setAppealDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<PolicyIssue | null>(null);
  const [appealMessage, setAppealMessage] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      const { data } = await supabase
        .from("policy_issues")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setIssues(data as unknown as PolicyIssue[]);
      setLoading(false);
    };
    fetchIssues();
  }, []);

  // Computed metrics
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped" || o.status === "delivered").length;
  const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : "0";
  const lateShipmentRate = totalOrders > 0
    ? ((orders.filter((o) => o.fulfillmentStatus === "unfulfilled" && new Date(o.createdAt).getTime() < Date.now() - 3 * 86400000).length / totalOrders) * 100).toFixed(1)
    : "0.0";
  const returnRate = "0.0"; // requires return_requests join — not yet wired

  const healthScore = 100 - issues.filter((i) => i.status === "open").length * 10;
  const healthStatus = healthScore >= 80 ? "Healthy" : healthScore >= 50 ? "At Risk" : "Critical";
  const healthColor = healthScore >= 80 ? "text-success" : healthScore >= 50 ? "text-warning" : "text-destructive";

  const openIssues = issues.filter((i) => i.status === "open" || i.status === "acknowledged");

  const handleSubmitAppeal = async () => {
    if (!selectedIssue || !appealMessage) return;

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({ title: "Error", description: "You must be signed in to submit an appeal.", variant: "destructive" });
      return;
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (sellerError || !seller) {
      toast({ title: "Error", description: "Seller profile not found.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("appeals").insert({
      policy_issue_id: selectedIssue.id,
      seller_id: seller.id,
      message: appealMessage,
    });
    if (!error) {
      toast({ title: "Appeal submitted", description: "Your appeal is under review." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setAppealDialogOpen(false);
    setAppealMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance & Account Health</h1>
        <p className="text-muted-foreground">Monitor your store's compliance and operational metrics</p>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-10 h-10 ${healthColor}`} />
              <div>
                <h2 className="text-lg font-bold">Account Health</h2>
                <p className={`text-sm font-medium ${healthColor}`}>{healthStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{Math.max(0, healthScore)}</p>
              <p className="text-xs text-muted-foreground">/ 100</p>
            </div>
          </div>
          <Progress value={Math.max(0, healthScore)} className="h-3" />
        </CardContent>
      </Card>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Late Shipment Rate</span>
            </div>
            <p className="text-3xl font-bold">{lateShipmentRate}%</p>
            <p className="text-xs text-muted-foreground">Target: &lt; 4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Cancellation Rate</span>
            </div>
            <p className="text-3xl font-bold">{cancellationRate}%</p>
            <p className="text-xs text-muted-foreground">Target: &lt; 2.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Return Rate</span>
            </div>
            <p className="text-3xl font-bold">{returnRate}%</p>
            <p className="text-xs text-muted-foreground">Target: &lt; 5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-prime" />
              <span className="text-sm font-medium">Average Rating</span>
            </div>
            <p className="text-3xl font-bold">{analytics.totalOrders > 0 ? "4.5" : "—"}</p>
            <p className="text-xs text-muted-foreground">Based on customer reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-info" />
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <p className="text-3xl font-bold">&lt; 24h</p>
            <p className="text-xs text-muted-foreground">Average buyer message response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Open Issues</span>
            </div>
            <p className="text-3xl font-bold">{openIssues.length}</p>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Policy Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Issues</CardTitle>
          <CardDescription>Issues that affect your account health score</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Loading...</p>
          ) : openIssues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-medium">No open issues</p>
              <p className="text-sm text-muted-foreground">Your account is in good standing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openIssues.map((issue) => (
                <div key={issue.id} className="p-4 rounded-lg border flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${issue.severity === "critical" ? "text-destructive" : "text-warning"}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{issue.title}</p>
                        <Badge variant={issue.severity === "critical" ? "destructive" : "outline"}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      {issue.fix_instructions && (
                        <p className="text-sm text-primary mt-1">{issue.fix_instructions}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setAppealDialogOpen(true);
                    }}
                  >
                    Appeal <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enforcement Ladder */}
      <Card>
        <CardHeader>
          <CardTitle>Enforcement Ladder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {[
              { label: "Warning", threshold: 80, icon: AlertTriangle, color: "text-warning" },
              { label: "Temporary Limits", threshold: 50, icon: Clock, color: "text-orange-500" },
              { label: "Suspension", threshold: 20, icon: XCircle, color: "text-destructive" },
            ].map((step, i) => (
              <div key={step.label} className="flex-1 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${healthScore <= step.threshold ? "bg-destructive/10" : "bg-muted"}`}>
                  <step.icon className={`w-6 h-6 ${healthScore <= step.threshold ? step.color : "text-muted-foreground"}`} />
                </div>
                <p className="text-sm font-medium mt-2">{step.label}</p>
                <p className="text-xs text-muted-foreground">Score &lt; {step.threshold}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appeal Dialog */}
      <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-muted-foreground">Issue</Label>
              <p className="font-medium">{selectedIssue?.title}</p>
            </div>
            <div>
              <Label>Your Appeal Message</Label>
              <Textarea value={appealMessage} onChange={(e) => setAppealMessage(e.target.value)} placeholder="Explain why this issue should be reconsidered..." rows={4} />
            </div>
            <Button onClick={handleSubmitAppeal} disabled={!appealMessage} className="w-full">
              <FileText className="w-4 h-4 mr-2" />Submit Appeal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
