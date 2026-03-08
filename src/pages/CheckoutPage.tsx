import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, Check, Clock, CreditCard, MapPin, Package, Plus, ShieldCheck, Truck } from "lucide-react";
import { LazyImage } from "@/components/LazyImage";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAddressBook } from "@/contexts/AddressBookContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { convertToIQD, formatIQD, FREE_SHIPPING_THRESHOLD_IQD } from "@/lib/currency";
import {
  getLocalizedCityLabel,
  getLocalizedGovernorateLabel,
  KURDISTAN_COUNTRY,
  normalizeIraqPhone,
} from "@/lib/kurdistan";
import type { AppLanguage } from "@/lib/locale";
import { submitCheckout } from "@/lib/writeApi";
import type { SavedAddress } from "@/types/address";

interface DeliveryOption {
  id: "standard" | "express" | "next-day";
  icon: "package" | "truck" | "clock";
  priceIQD: number;
  nameKey:
    | "checkout.standardDelivery"
    | "checkout.expressDelivery"
    | "checkout.nextDayDelivery";
  descriptionKey:
    | "checkout.deliveredByPostal"
    | "checkout.fastDelivery"
    | "checkout.orderBy2pm";
  etaKey:
    | "checkout.businessDays57"
    | "checkout.businessDays23"
    | "checkout.nextBusinessDay";
}

interface PaymentMethodOption {
  id: "fib" | "cod" | "stripe";
  icon: "fib" | "cod" | "stripe";
  recommended?: boolean;
  labelKey:
    | "checkout.payWithFib"
    | "checkout.cashOnDelivery"
    | "checkout.payWithCard";
  descriptionKey:
    | "checkout.fibDescription"
    | "checkout.codDescription"
    | "checkout.cardDescription";
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    icon: "package",
    priceIQD: 6500,
    nameKey: "checkout.standardDelivery",
    descriptionKey: "checkout.deliveredByPostal",
    etaKey: "checkout.businessDays57",
  },
  {
    id: "express",
    icon: "truck",
    priceIQD: 13000,
    nameKey: "checkout.expressDelivery",
    descriptionKey: "checkout.fastDelivery",
    etaKey: "checkout.businessDays23",
  },
  {
    id: "next-day",
    icon: "clock",
    priceIQD: 19500,
    nameKey: "checkout.nextDayDelivery",
    descriptionKey: "checkout.orderBy2pm",
    etaKey: "checkout.nextBusinessDay",
  },
];

const paymentMethods: PaymentMethodOption[] = [
  {
    id: "fib",
    icon: "fib",
    recommended: true,
    labelKey: "checkout.payWithFib",
    descriptionKey: "checkout.fibDescription",
  },
  {
    id: "cod",
    icon: "cod",
    labelKey: "checkout.cashOnDelivery",
    descriptionKey: "checkout.codDescription",
  },
  {
    id: "stripe",
    icon: "stripe",
    labelKey: "checkout.payWithCard",
    descriptionKey: "checkout.cardDescription",
  },
];

function getDeliveryIcon(icon: DeliveryOption["icon"]) {
  if (icon === "clock") return <Clock className="w-4 h-4 text-prime" />;
  if (icon === "truck") return <Truck className="w-4 h-4 text-info" />;
  return <Package className="w-4 h-4 text-muted-foreground" />;
}

function getPaymentIcon(icon: PaymentMethodOption["icon"]) {
  if (icon === "cod") return <Banknote className="w-4 h-4 text-muted-foreground" />;
  return <CreditCard className="w-4 h-4 text-muted-foreground" />;
}

function formatAddress(address: SavedAddress, language: AppLanguage) {
  return [
    address.street,
    address.district,
    `${getLocalizedCityLabel(address.city, address.governorate, language)}, ${getLocalizedGovernorateLabel(address.governorate, language)}`,
    address.landmark,
    address.postalCode,
    KURDISTAN_COUNTRY.label[language],
  ].filter(Boolean);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { activeItems, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    selectAddress,
    openAddressManager,
  } = useAddressBook();

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption["id"]>("standard");
  const [selectedPaymentId, setSelectedPaymentId] = useState<PaymentMethodOption["id"]>("fib");
  const [customerPhone, setCustomerPhone] = useState(selectedAddress?.phone ?? "+964");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const selectedDeliveryOption = deliveryOptions.find((option) => option.id === selectedDelivery);
  const subtotalIQD = convertToIQD(subtotal);
  const isFreeStandardShipping =
    selectedDelivery === "standard" && subtotalIQD >= FREE_SHIPPING_THRESHOLD_IQD;
  const shippingCostIQD = selectedDeliveryOption
    ? selectedDeliveryOption.id === "standard" && isFreeStandardShipping
      ? 0
      : selectedDeliveryOption.priceIQD
    : 0;
  const feesAmountIQD = 0;
  const orderTotalIqd = subtotalIQD + shippingCostIQD + feesAmountIQD;
  const lineItems = activeItems.map((item) => ({
    productRef: item.product.id,
    title: item.product.title,
    quantity: item.quantity,
    unitPrice: convertToIQD(item.product.offer.price),
    currencyCode: "IQD",
  }));

  useEffect(() => {
    if (!selectedAddress) return;
    setCustomerPhone(selectedAddress.phone);
  }, [selectedAddress]);

  const handlePlaceOrder = async () => {
    const normalizedPhone = normalizeIraqPhone(customerPhone);

    if (!selectedAddress || !selectedAddressId) {
      toast({
        title: t("checkout.missingAddressDetails"),
        description: t("checkout.selectDeliveryAddress"),
        variant: "destructive",
      });
      return;
    }

    if (!normalizedPhone) {
      toast({
        title: t("checkout.invalidPhone"),
        description: t("checkout.validKurdistanPhoneRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);
    const result = await submitCheckout({
      cartId: "active-cart",
      shippingAddressId: selectedAddressId,
      billingAddressId: selectedAddressId,
      paymentMethod: selectedPaymentId,
      deliveryOption: selectedDelivery,
      currencyCode: "IQD",
      clientTotal: orderTotalIqd,
      regionCode: "KRD",
      countryCode: KURDISTAN_COUNTRY.code,
      customerPhone: normalizedPhone,
      description: "Dukanly Kurdistan checkout",
      lineItems,
    });

    if (!result.ok) {
      toast({
        title: t("checkout.checkoutFailed"),
        description: result.failure?.message ?? t("checkout.checkoutFailedDesc"),
        variant: "destructive",
      });
      setIsPlacingOrder(false);
      return;
    }

    if (result.data.paymentMethod === "stripe" && result.data.stripe?.sessionUrl) {
      window.location.href = result.data.stripe.sessionUrl;
      return;
    }

    if (result.data.paymentMethod === "fib" && result.data.fib) {
      navigate(`/checkout/payment/${result.data.orderId}`, {
        state: { payment: result.data },
      });
      setIsPlacingOrder(false);
      return;
    }

    clearCart();
    navigate("/order-confirmation", { state: { order: result.data } });
  };

  if (activeItems.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">{t("checkout.emptyCart")}</h1>
            <p className="text-muted-foreground mb-6">{t("checkout.addItemsFirst")}</p>
            <Button asChild className="btn-cta">
              <Link to="/">{t("common.continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 md:py-14">
        <div className="max-w-5xl mx-auto mb-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
          <h1 className="page-title !text-2xl">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("checkout.kurdistanLaunchNote")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">1</span>
                  {t("checkout.shippingAddress")}
                </h2>
                <Button variant="outline" size="sm" onClick={openAddressManager}>
                  <Plus className="mr-1 h-4 w-4 rtl:mr-0 rtl:ml-1" />
                  {t("addressBook.manageAddresses")}
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">{t("addressBook.noAddresses")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("addressBook.noAddressesDesc")}</p>
                  <Button className="mt-4" onClick={openAddressManager}>
                    {t("addressBook.addAddress")}
                  </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId ?? ""} onValueChange={selectAddress} className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{address.name}</span>
                          {address.isDefault && (
                            <span className="rounded bg-secondary px-2 py-0.5 text-xs">{t("common.default")}</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                          {address.phone}
                        </p>
                        <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                          {formatAddress(address, language).map((line) => (
                            <p key={`${address.id}-${line}`}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2">
                <div>
                  <label htmlFor="customer-phone" className="text-sm font-medium">
                    {t("checkout.contactPhone")}
                  </label>
                    <input
                    id="customer-phone"
                    dir="ltr"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder={t("checkout.contactPhonePlaceholder")}
                    maxLength={15}
                    pattern="^\+?[0-9]{7,15}$"
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t("checkout.contactPhoneHint")}</p>
                </div>
                <div>
                  <label htmlFor="instructions" className="text-sm font-medium">
                    {t("checkout.deliveryInstructions")}
                  </label>
                  <input
                    id="instructions"
                    value={deliveryInstructions}
                    onChange={(event) => setDeliveryInstructions(event.target.value)}
                    placeholder={t("checkout.deliveryInstructionsPlaceholder")}
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">2</span>
                  {t("checkout.deliveryOptions")}
                </h2>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  {t("checkout.deliveryCoverage")}
                </span>
              </div>

              <RadioGroup
                value={selectedDelivery}
                onValueChange={(value) => setSelectedDelivery(value as DeliveryOption["id"])}
                className="space-y-3"
              >
                {deliveryOptions.map((option) => {
                  const isFreeStandard = option.id === "standard" && isFreeStandardShipping;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedDelivery === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {getDeliveryIcon(option.icon)}
                            <span className="font-medium">{t(option.nameKey)}</span>
                          </div>
                          <span className="font-semibold">
                            {isFreeStandard ? (
                              <span className="text-success">{t("checkout.free")}</span>
                            ) : (
                              formatIQD(option.priceIQD)
                            )}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t(option.descriptionKey)} • {t(option.etaKey)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>

              {subtotalIQD >= FREE_SHIPPING_THRESHOLD_IQD && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
                  <Check className="h-4 w-4" />
                  {t("checkout.qualifiesFreeShipping")}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">3</span>
                {t("checkout.paymentMethod")}
              </h2>

              <RadioGroup
                value={selectedPaymentId}
                onValueChange={(value) => setSelectedPaymentId(value as PaymentMethodOption["id"])}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedPaymentId === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPaymentIcon(method.icon)}
                        <span className="font-medium">{t(method.labelKey)}</span>
                        {method.recommended && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                            {t("checkout.recommended")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t(method.descriptionKey)}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {selectedPaymentId === "cod" && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">{t("checkout.codVerificationRequired")}</p>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox checked={isGiftOrder} onCheckedChange={(checked) => setIsGiftOrder(Boolean(checked))} className="mt-1" />
                <div>
                  <span className="font-medium">{t("checkout.giftOrder")}</span>
                  <p className="text-sm text-muted-foreground">{t("checkout.priceNotShown")}</p>
                </div>
              </label>

              {isGiftOrder && (
                <div className="mt-4 border-t border-border pt-4">
                  <label htmlFor="gift-message" className="text-sm font-medium">
                    {t("checkout.giftMessage")}
                  </label>
                  <Textarea
                    id="gift-message"
                    value={giftMessage}
                    onChange={(event) => setGiftMessage(event.target.value)}
                    placeholder={t("checkout.addPersonalMessage")}
                    className="mt-2 min-h-[96px]"
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {giftMessage.length}/200 {t("checkout.characters")}
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4 rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold">{t("checkout.orderSummary")}</h2>

              <div className="max-h-48 space-y-3 overflow-y-auto">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <LazyImage
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-12 w-12 rounded object-contain"
                      wrapperClassName="h-12 w-12 rounded bg-secondary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("product.qty")} {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatIQD(convertToIQD(item.product.offer.price * item.quantity))}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                  <span>{formatIQD(subtotalIQD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                  <span>
                    {shippingCostIQD === 0 ? (
                      <span className="text-success">{t("checkout.free")}</span>
                    ) : (
                      formatIQD(shippingCostIQD)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.taxEstimated")}</span>
                  <span>{formatIQD(feesAmountIQD)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("checkout.orderTotal")}</span>
                  <span>{formatIQD(orderTotalIqd)}</span>
                </div>
              </div>

              {selectedAddress && (
                <div className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p className="mb-1 font-medium text-foreground">{t("checkout.deliveringTo")}</p>
                  <p className="text-foreground">{selectedAddress.name}</p>
                  <p dir="ltr">{customerPhone}</p>
                  {formatAddress(selectedAddress, language).map((line) => (
                    <p key={`summary-${selectedAddress.id}-${line}`}>{line}</p>
                  ))}
                </div>
              )}

              <Button className="w-full btn-cta" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? t("checkout.processing") : t("checkout.placeOrder")}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t("checkout.agreeTerms")}{" "}
                <Link to="/terms" className="text-info hover:underline">
                  {t("checkout.termsOfService")}
                </Link>{" "}
                {t("common.and")}{" "}
                <Link to="/privacy" className="text-info hover:underline">
                  {t("checkout.privacyPolicy")}
                </Link>
              </p>

              <div className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {t("checkout.secureSSL")}
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  {t("checkout.dayReturns")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
