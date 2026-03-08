import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
} from "lucide-react";
import { useSeller } from "@/contexts/SellerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SellerOrder } from "@/types/seller";
import { useToast } from "@/hooks/use-toast";
import { formatIQD, convertToIQD } from "@/lib/currency";

export default function SellerOrders() {
  const { orders, updateOrderStatus, updateFulfillmentStatus } = useSeller();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const orderActionsUnavailableMessage =
    "Order status and fulfillment changes are disabled until seller order persistence is fully connected.";

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesFulfillment =
      fulfillmentFilter === "all" || order.fulfillmentStatus === fulfillmentFilter;

    return matchesSearch && matchesStatus && matchesFulfillment;
  });

  const getStatusBadge = (status: SellerOrder["status"]) => {
    const config = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      processing: { variant: "default" as const, icon: Package, label: "Processing" },
      shipped: { variant: "default" as const, icon: Truck, label: "Shipped" },
      delivered: { variant: "default" as const, icon: CheckCircle, label: "Delivered" },
      cancelled: { variant: "destructive" as const, icon: XCircle, label: "Cancelled" },
      refunded: { variant: "outline" as const, icon: XCircle, label: "Refunded" },
    };
    const { variant, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getFulfillmentBadge = (status: SellerOrder["fulfillmentStatus"]) => {
    switch (status) {
      case "fulfilled":
        return <Badge className="bg-success text-white">Fulfilled</Badge>;
      case "partial":
        return <Badge variant="secondary">Partial</Badge>;
      case "unfulfilled":
        return <Badge variant="outline">Unfulfilled</Badge>;
    }
  };

  const handleFulfill = (order: SellerOrder) => {
    setSelectedOrder(order);
    setTrackingNumber("");
    setFulfillDialogOpen(true);
  };

  const confirmFulfill = async () => {
    if (selectedOrder) {
      try {
        await updateFulfillmentStatus(selectedOrder.id, "fulfilled", trackingNumber || undefined);
        setFulfillDialogOpen(false);
        setSelectedOrder(null);
      } catch (error) {
        toast({
          title: "Fulfillment update failed",
          description: error instanceof Error ? error.message : "Could not update order fulfillment.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewOrder = (order: SellerOrder) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage and fulfill customer orders
        </p>
      </div>

      <Alert>
        <AlertTitle>Order updates are disabled</AlertTitle>
        <AlertDescription>{orderActionsUnavailableMessage}</AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length}
          </p>
          <p className="text-sm text-muted-foreground">To Fulfill</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {orders.filter((o) => o.status === "processing").length}
          </p>
          <p className="text-sm text-muted-foreground">Processing</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {orders.filter((o) => o.status === "shipped").length}
          </p>
          <p className="text-sm text-muted-foreground">Shipped</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {orders.filter((o) => o.status === "delivered").length}
          </p>
          <p className="text-sm text-muted-foreground">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Fulfillment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">No orders found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="font-medium text-info hover:underline"
                    >
                      {order.orderNumber}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={item.productImage}
                            alt=""
                            className="w-8 h-8 rounded border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatIQD(convertToIQD(order.total))}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getFulfillmentBadge(order.fulfillmentStatus)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {order.fulfillmentStatus !== "fulfilled" &&
                          order.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => handleFulfill(order)}>
                              <Truck className="w-4 h-4 mr-2" />
                              Mark as Fulfilled
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem>
                          <Printer className="w-4 h-4 mr-2" />
                          Print Packing Slip
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status === "pending" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await updateOrderStatus(order.id, "processing");
                              } catch (error) {
                                toast({
                                  title: "Order update failed",
                                  description:
                                    error instanceof Error
                                      ? error.message
                                      : "Could not update order status.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Start Processing
                          </DropdownMenuItem>
                        )}
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order.id, "cancelled");
                                } catch (error) {
                                  toast({
                                    title: "Order cancel failed",
                                    description:
                                      error instanceof Error
                                        ? error.message
                                        : "Could not cancel order.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fulfill Dialog */}
      <Dialog open={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfill Order</DialogTitle>
            <DialogDescription>
              Mark this order as shipped. Add a tracking number to help customers
              track their package.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tracking">Tracking Number (optional)</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., 1Z999AA10123456784"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmFulfill}>Mark as Fulfilled</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedOrder.status)}
                  {getFulfillmentBadge(selectedOrder.fulfillmentStatus)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatIQD(convertToIQD(item.price))}
                        </p>
                      </div>
                      <span className="font-semibold">{formatIQD(convertToIQD(item.total))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground">
                    <p className="text-foreground font-medium">
                      {selectedOrder.shippingAddress.name}
                    </p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zip}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.customerName}</p>
                    <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">Tracking</p>
                      <p className="font-mono text-sm">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatIQD(convertToIQD(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatIQD(convertToIQD(selectedOrder.shippingCost))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatIQD(convertToIQD(selectedOrder.tax))}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatIQD(convertToIQD(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
