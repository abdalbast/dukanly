import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Order { id: string; orderNumber: string; date: string; status: "processing" | "shipped" | "delivered" | "cancelled"; total: number; items: { id: string; title: string; image: string; price: number; quantity: number; }[]; }

const mockOrders: Order[] = [
  { id: "1", orderNumber: "ORD-12345678", date: "2024-02-01", status: "delivered", total: 124.99, items: [{ id: "item1", title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones", image: "/placeholder.svg", price: 348.00, quantity: 1 }] },
  { id: "2", orderNumber: "ORD-12345679", date: "2024-01-28", status: "shipped", total: 89.95, items: [{ id: "item2", title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker", image: "/placeholder.svg", price: 79.95, quantity: 1 }] },
];

export default function OrdersPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const locale = language === "ckb" ? "ckb" : "en-US";

  const getStatusBadge = (status: Order["status"]) => {
    const map = {
      processing: { cls: "bg-secondary", icon: Package, label: t("orders.processing") },
      shipped: { cls: "bg-info text-white", icon: Truck, label: t("orders.shipped") },
      delivered: { cls: "bg-success text-white", icon: CheckCircle, label: t("orders.delivered") },
      cancelled: { cls: "", icon: Package, label: t("orders.cancelled") },
    };
    const { cls, icon: Icon, label } = map[status];
    return status === "cancelled" ? <Badge variant="destructive" className="flex items-center gap-1">{label}</Badge> : <Badge className={`${cls} flex items-center gap-1`}><Icon className="w-3 h-3" />{label}</Badge>;
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{t("orders.title")}</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("orders.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rtl:pl-3 rtl:pr-9" />
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("orders.allOrders")}</SelectItem>
              <SelectItem value="30">{t("orders.last30Days")}</SelectItem>
              <SelectItem value="90">{t("orders.last3Months")}</SelectItem>
              <SelectItem value="365">{t("orders.pastYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mockOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("orders.noOrdersYet")}</h2>
            <p className="text-muted-foreground mb-6">{t("orders.noOrdersMessage")}</p>
            <Button asChild className="btn-cta"><Link to="/">{t("common.startShopping")}</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div><p className="text-muted-foreground">{t("orders.orderPlaced")}</p><p className="font-medium">{new Date(order.date).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}</p></div>
                    <div><p className="text-muted-foreground">{t("orders.total")}</p><p className="font-medium">${order.total.toFixed(2)}</p></div>
                    <div><p className="text-muted-foreground">{t("orders.orderNumber")}</p><p className="font-medium">{order.orderNumber}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Button variant="outline" size="sm">{t("orders.viewOrderDetails")}</Button>
                  </div>
                </div>
                <div className="p-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Link to={`/product/${item.id}`} className="shrink-0"><img src={item.image} alt={item.title} className="w-20 h-20 object-contain bg-secondary rounded" /></Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`} className="font-medium hover:text-primary line-clamp-2">{item.title}</Link>
                        <p className="text-sm text-muted-foreground mt-1">{t("orders.qty")} {item.quantity}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button variant="outline" size="sm">{t("orders.buyItAgain")}</Button>
                          <Button variant="outline" size="sm"><RotateCcw className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />{t("orders.returnOrReplace")}</Button>
                          <Button variant="ghost" size="sm">{t("orders.writeReview")}</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {order.status === "shipped" && (
                  <div className="border-t border-border p-4 bg-info/5">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-info" />
                      <div className="flex-1">
                        <p className="font-medium text-info">{t("orders.packageOnWay")}</p>
                        <p className="text-sm text-muted-foreground">{t("orders.expectedDelivery")}</p>
                      </div>
                      <Button size="sm">{t("orders.trackPackage")}</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
