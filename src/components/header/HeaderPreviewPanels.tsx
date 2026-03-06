import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TranslationKey } from "@/i18n/en";
import { useLanguage } from "@/i18n/LanguageContext";
import { convertToIQD, formatIQD } from "@/lib/currency";
import type { AppLanguage } from "@/lib/locale";

interface PreviewPanelProps {
  description: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  children: ReactNode;
}

function ResponsivePreviewPanel({
  description,
  onOpenChange,
  open,
  title,
  children,
}: PreviewPanelProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh] px-0">
          <DrawerHeader className="border-b px-4 pb-4">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl overflow-hidden p-0 sm:rounded-3xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function formatOrderTotal(order: Order, language: AppLanguage) {
  if (order.currencyCode === "IQD") {
    return formatIQD(order.total, language);
  }

  return new Intl.NumberFormat(language === "ckb" ? "ckb" : "en-US", {
    style: "currency",
    currency: order.currencyCode || "USD",
    maximumFractionDigits: 2,
  }).format(order.total);
}

function getOrderStatusLabel(
  order: Order,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
) {
  const map = {
    processing: t("orders.processing"),
    shipped: t("orders.shipped"),
    delivered: t("orders.delivered"),
    cancelled: t("orders.cancelled"),
  } satisfies Record<Order["status"], string>;

  return map[order.status];
}

export function OrdersPreviewPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrders();
  const latestOrders = orders.slice(0, 3);
  const latestOrder = latestOrders[0];

  return (
    <ResponsivePreviewPanel
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("header.returns")} ${t("header.andOrders")}`}
      description={t("header.ordersPreviewHint")}
    >
      {!user ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border p-5 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">{t("header.orders")}</p>
            <p className="text-sm text-muted-foreground">{t("header.signInForOrders")}</p>
          </div>
          <Button asChild className="w-full">
            <Link to="/auth/signin" onClick={() => onOpenChange(false)}>
              {t("header.signIn")}
            </Link>
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-muted/70" />
          <div className="h-16 animate-pulse rounded-2xl bg-muted/70" />
        </div>
      ) : latestOrders.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border p-5 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">{t("orders.noOrdersYet")}</p>
            <p className="text-sm text-muted-foreground">{t("orders.noOrdersMessage")}</p>
          </div>
          <Button asChild className="w-full">
            <Link to="/" onClick={() => onOpenChange(false)}>
              {t("common.startShopping")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {latestOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("orders.orderNumber")}
                  </p>
                  <p className="text-base font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString(language === "ckb" ? "ckb" : "en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {getOrderStatusLabel(order, t)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-14 w-14 rounded-xl bg-secondary object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("orders.qty")} {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatIQD(convertToIQD(item.price), language)}</p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-muted-foreground">
                    {t("header.moreItems", { count: order.items.length - 2 })}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("orders.total")}</p>
                  <p className="text-lg font-semibold">{formatOrderTotal(order, language)}</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/orders" onClick={() => onOpenChange(false)}>
                    {t("orders.viewOrderDetails")}
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/orders" onClick={() => onOpenChange(false)}>
                {t("header.viewAllOrders")}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/orders" onClick={() => onOpenChange(false)}>
                {latestOrder?.status === "shipped" ? t("orders.trackPackage") : t("orders.viewOrderDetails")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </ResponsivePreviewPanel>
  );
}

export function CartPreviewPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, language } = useLanguage();
  const { activeItems, itemCount, savedItems, subtotal } = useCart();
  const previewItems = activeItems.slice(0, 3);
  const subtotalIQD = convertToIQD(subtotal);

  return (
    <ResponsivePreviewPanel
      open={open}
      onOpenChange={onOpenChange}
      title={t("header.cart")}
      description={t("header.cartPreviewHint")}
    >
      {previewItems.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border p-5 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">{t("cart.yourCartEmpty")}</p>
            <p className="text-sm text-muted-foreground">{t("cart.emptyMessage")}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/cart" onClick={() => onOpenChange(false)}>
                {t("header.viewCart")}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/" onClick={() => onOpenChange(false)}>
                {t("common.continueShopping")}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {previewItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="h-16 w-16 rounded-xl bg-secondary object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{item.product.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("orders.qty")} {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatIQD(convertToIQD(item.product.offer.price * item.quantity), language)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span className="font-semibold">{formatIQD(subtotalIQD, language)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}
              </span>
              {savedItems.length > 0 && (
                <span className="text-muted-foreground">
                  {t("header.savedForLaterCount", { count: savedItems.length })}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-background/90 p-3 text-sm">
              <Truck className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-muted-foreground">{t("cart.dayReturns")}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/cart" onClick={() => onOpenChange(false)}>
                {t("header.viewCart")}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/checkout" onClick={() => onOpenChange(false)}>
                {t("cart.proceedToCheckout")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </ResponsivePreviewPanel>
  );
}
