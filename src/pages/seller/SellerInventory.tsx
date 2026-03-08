import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSeller } from "@/contexts/SellerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertTriangle, Search, Plus, Minus } from "lucide-react";

interface InventoryRow {
  id: string;
  product_id: string;
  quantity_on_hand: number;
  reserved_quantity: number;
  reorder_point: number;
  products: { title: string; sku: string; base_price: number; status: string } | null;
}

export default function SellerInventory() {
  const { sellerId } = useSeller();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("received");

  useEffect(() => {
    if (!sellerId) return;
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id, product_id, quantity_on_hand, reserved_quantity, reorder_point, products(title, sku, base_price, status)")
        .order("updated_at", { ascending: false });

      if (!error && data) {
        // Filter to only this seller's products
        const filtered = (data as unknown as InventoryRow[]).filter((row) => row.products !== null);
        setItems(filtered);
      }
      setLoading(false);
    };
    fetchInventory();
  }, [sellerId]);

  const filtered = items.filter((item) => {
    const title = item.products?.title?.toLowerCase() || "";
    const sku = item.products?.sku?.toLowerCase() || "";
    const matchesSearch = title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
    if (stockFilter === "low") return matchesSearch && item.quantity_on_hand <= item.reorder_point && item.quantity_on_hand > 0;
    if (stockFilter === "out") return matchesSearch && item.quantity_on_hand === 0;
    if (stockFilter === "in") return matchesSearch && item.quantity_on_hand > item.reorder_point;
    return matchesSearch;
  });

  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.quantity_on_hand <= i.reorder_point && i.quantity_on_hand > 0).length;
  const outOfStockCount = items.filter((i) => i.quantity_on_hand === 0).length;

  const handleAdjust = async () => {
    if (!selectedItem || adjustQty === 0) return;
    const newQty = selectedItem.quantity_on_hand + adjustQty;
    const { error } = await supabase
      .from("inventory")
      .update({ quantity_on_hand: Math.max(0, newQty) })
      .eq("id", selectedItem.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Stock adjusted", description: `${adjustQty > 0 ? "Added" : "Removed"} ${Math.abs(adjustQty)} units. Reason: ${adjustReason}` });
      setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, quantity_on_hand: Math.max(0, newQty) } : i));
    }
    setAdjustDialogOpen(false);
    setAdjustQty(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Manage stock levels and track inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Package className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Total SKUs</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Package className="w-8 h-8 text-success" /><div><p className="text-2xl font-bold">{totalItems - lowStockCount - outOfStockCount}</p><p className="text-xs text-muted-foreground">In Stock</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-warning" /><div><p className="text-2xl font-bold">{lowStockCount}</p><p className="text-xs text-muted-foreground">Low Stock</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-destructive" /><div><p className="text-2xl font-bold">{outOfStockCount}</p><p className="text-xs text-muted-foreground">Out of Stock</p></div></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-right p-3 font-medium">On Hand</th>
                  <th className="text-right p-3 font-medium">Reserved</th>
                  <th className="text-right p-3 font-medium">Available</th>
                  <th className="text-right p-3 font-medium">Reorder Point</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading inventory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No inventory items found</td></tr>
                ) : (
                  filtered.map((item) => {
                    const available = item.quantity_on_hand - item.reserved_quantity;
                    const isLow = item.quantity_on_hand <= item.reorder_point && item.quantity_on_hand > 0;
                    const isOut = item.quantity_on_hand === 0;
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium max-w-[200px] truncate">{item.products?.title}</td>
                        <td className="p-3 text-muted-foreground">{item.products?.sku}</td>
                        <td className="p-3 text-right">{item.quantity_on_hand}</td>
                        <td className="p-3 text-right">{item.reserved_quantity}</td>
                        <td className="p-3 text-right font-medium">{available}</td>
                        <td className="p-3 text-right">{item.reorder_point}</td>
                        <td className="p-3 text-center">
                          {isOut ? <Badge variant="destructive">Out of Stock</Badge>
                            : isLow ? <Badge className="bg-warning/20 text-warning border-warning/30">Low Stock</Badge>
                            : <Badge variant="secondary">In Stock</Badge>}
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setAdjustDialogOpen(true); }}>Adjust</Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock — {selectedItem?.products?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold">{selectedItem?.quantity_on_hand} units</p>
            </div>
            <div>
              <Label>Adjustment Quantity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="icon" onClick={() => setAdjustQty((q) => q - 1)}><Minus className="w-4 h-4" /></Button>
                <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)} className="w-24 text-center" />
                <Button variant="outline" size="icon" onClick={() => setAdjustQty((q) => q + 1)}><Plus className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">New stock: {(selectedItem?.quantity_on_hand ?? 0) + adjustQty}</p>
            </div>
            <div>
              <Label>Reason</Label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Stock Received</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="returned">Customer Return</SelectItem>
                  <SelectItem value="correction">Inventory Correction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdjust} className="w-full" disabled={adjustQty === 0}>Apply Adjustment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
