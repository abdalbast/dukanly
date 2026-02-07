import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  ChevronLeft,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeller } from "@/contexts/SellerContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", path: "/seller", icon: LayoutDashboard },
  { title: "Products", path: "/seller/products", icon: Package },
  { title: "Orders", path: "/seller/orders", icon: ShoppingCart },
  { title: "Analytics", path: "/seller/analytics", icon: TrendingUp },
  { title: "Settings", path: "/seller/settings", icon: Settings },
];

export function SellerSidebar() {
  const location = useLocation();
  const { profile, products } = useSeller();

  const lowStockCount = products.filter(
    (p) => p.stock <= p.lowStockThreshold && p.status === "active"
  ).length;

  const pendingOrdersCount = products.filter((p) => p.stock === 0).length;

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Store Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {profile.logo ? (
            <img
              src={profile.logo}
              alt={profile.storeName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{profile.storeName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {profile.isVerified && (
                <span className="text-success">✓ Verified</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/seller"
              ? location.pathname === "/seller"
              : location.pathname.startsWith(item.path);

          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
              {item.title === "Products" && lowStockCount > 0 && (
                <span className="ml-auto bg-deal text-white text-xs px-1.5 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div className="p-3 border-t border-border">
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warning">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">
                  {lowStockCount} product{lowStockCount > 1 ? "s" : ""} need restocking
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Store */}
      <div className="p-3 border-t border-border">
        <Button variant="ghost" asChild className="w-full justify-start">
          <RouterNavLink to="/">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </RouterNavLink>
        </Button>
      </div>
    </aside>
  );
}
