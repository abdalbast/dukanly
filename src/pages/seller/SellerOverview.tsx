import { useState, useEffect } from "react";
import {
  ShoppingCart, Package, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, FileText, Truck, Wallet, AlertTriangle, CheckCircle, Clock,
} from "lucide-react";
import { useSeller } from "@/contexts/SellerContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { formatIQD, convertToIQD } from "@/lib/currency";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function SellerOverview() {
  const { analytics, orders, products } = useSeller();
  const [policyIssueCount, setPolicyIssueCount] = useState(0);

  useEffect(() => {
    supabase.from("policy_issues").select("id", { count: "exact", head: true }).eq("status", "open").then(({ count }) => {
      if (count !== null) setPolicyIssueCount(count);
    });
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const unfulfilledOrders = orders.filter((o) => o.fulfillmentStatus === "unfulfilled");
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold && p.status === "active");

  // Task queue items
  const tasks = [
    ...(unfulfilledOrders.length > 0 ? [{ label: `${unfulfilledOrders.length} order${unfulfilledOrders.length > 1 ? "s" : ""} need shipping`, link: "/seller/orders", icon: Truck, color: "text-warning" }] : []),
    ...(lowStockProducts.length > 0 ? [{ label: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? "s" : ""} low on stock`, link: "/seller/inventory", icon: Package, color: "text-destructive" }] : []),
    ...(policyIssueCount > 0 ? [{ label: `${policyIssueCount} compliance issue${policyIssueCount > 1 ? "s" : ""}`, link: "/seller/performance", icon: AlertTriangle, color: "text-warning" }] : []),
  ];

  const statCards = [
    { title: "Total Revenue", value: formatIQD(convertToIQD(analytics.totalRevenue)), change: analytics.revenueChange, icon: Wallet, color: "text-success" },
    { title: "Total Orders", value: analytics.totalOrders.toString(), change: analytics.ordersChange, icon: ShoppingCart, color: "text-info" },
    { title: "Active Products", value: products.filter((p) => p.status === "active").length.toString(), change: null, icon: Package, color: "text-primary" },
    { title: "Conversion Rate", value: `${analytics.conversionRate}%`, change: analytics.viewsChange, icon: TrendingUp, color: "text-prime" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's how your store is performing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/seller/reports"><FileText className="w-4 h-4 mr-1" />Reports</Link></Button>
          <Button asChild className="btn-cta" size="sm"><Link to="/seller/products/new"><Plus className="w-4 h-4 mr-1" />Add Product</Link></Button>
        </div>
      </div>

      {/* Task Queue */}
      {tasks.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">Today's Tasks</h3>
              <Badge variant="outline" className="ml-auto">{tasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <Link key={i} to={task.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <task.icon className={`w-4 h-4 ${task.color}`} />
                  <span className="text-sm">{task.label}</span>
                  <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">All caught up! No pending tasks.</span>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-current/10`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.change !== null && (
                  <div className={`flex items-center text-xs font-medium ${stat.change >= 0 ? "text-success" : "text-destructive"}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} className="text-xs" />
                  <YAxis tickFormatter={(v) => formatIQD(convertToIQD(v))} className="text-xs" />
                  <Tooltip formatter={(v: number) => [formatIQD(convertToIQD(v)), "Revenue"]} labelFormatter={(l) => new Date(l).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analytics.topProducts.slice(0, 4).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                </div>
                <span className="text-sm font-semibold">{formatIQD(convertToIQD(product.revenue))}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/seller/orders">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No pending orders</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName} • {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatIQD(convertToIQD(order.total))}</p>
                      <Badge variant={order.status === "pending" ? "secondary" : "default"} className="text-xs">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/seller/inventory">Manage</Link></Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All products are well stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">{product.title}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="text-xs">
                      {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
