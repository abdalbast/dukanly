import { Home, Grid2x2, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/", badge: false, authAware: false },
  { icon: Grid2x2, label: "Categories", path: "/category", badge: false, authAware: false },
  { icon: ShoppingCart, label: "Cart", path: "/cart", badge: true, authAware: false },
  { icon: User, label: "Account", path: "/account", badge: false, authAware: true },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-14">
        {tabs.map(({ icon: Icon, label, path, badge, authAware }) => {
          const href = authAware && !user ? "/auth/signin" : path;
          const isActive =
            path === "/" ? pathname === "/" : pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {badge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
