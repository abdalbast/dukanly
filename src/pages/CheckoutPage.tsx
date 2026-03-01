import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Plus, 
  Truck, 
  CreditCard, 
  Banknote,
  ShieldCheck, 
  Clock,
  Package,
  Check
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { submitCheckout } from "@/lib/writeApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: "fib" | "cod";
  type: "fib" | "cod";
  label: string;
  description: string;
}

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    name: "Kurdistan Launch Customer",
    street: "100 Gulan Street",
    city: "Erbil",
    state: "Erbil Governorate",
    zip: "44001",
    country: "Iraq",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Kurdistan Launch Customer",
    street: "21 Salim Street",
    city: "Sulaymaniyah",
    state: "Sulaymaniyah Governorate",
    zip: "46001",
    country: "Iraq",
    isDefault: false,
  },
];

const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivered by postal service",
    price: 4.99,
    estimatedDays: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Fast delivery to your door",
    price: 9.99,
    estimatedDays: "2-3 business days",
  },
  {
    id: "next-day",
    name: "Next Day Delivery",
    description: "Order by 2pm for next day",
    price: 14.99,
    estimatedDays: "Next business day",
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "fib",
    type: "fib",
    label: "Pay with FIB",
    description: "Complete payment using FIB app links or QR code.",
  },
  {
    id: "cod",
    type: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order is delivered.",
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { activeItems, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const exchangeRateUsdToIqd = 1300;
  
  const [addresses] = useState<Address[]>(mockAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    mockAddresses.find((a) => a.isDefault)?.id || mockAddresses[0]?.id
  );
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0].id);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [selectedPaymentId, setSelectedPaymentId] = useState<"fib" | "cod">("cod");
  const [customerPhone, setCustomerPhone] = useState("+964");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "Iraq",
  });

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedDeliveryOption = deliveryOptions.find((d) => d.id === selectedDelivery);
  const shippingCost = selectedDeliveryOption?.price || 0;
  const taxRate = 0.02;
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;
  const orderTotalIqd = Math.round(orderTotal * exchangeRateUsdToIqd);
  const lineItems = activeItems.map((item) => ({
    productRef: item.product.id,
    title: item.product.title,
    quantity: item.quantity,
    unitPrice: Math.round(item.product.offer.price * exchangeRateUsdToIqd),
    currencyCode: "IQD",
  }));

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const result = await submitCheckout({
      cartId: "active-cart",
      shippingAddressId: selectedAddressId,
      billingAddressId: selectedAddressId,
      paymentMethod: selectedPaymentId,
      deliveryOption: selectedDelivery as "standard" | "express" | "next-day",
      currencyCode: "IQD",
      clientTotal: orderTotalIqd,
      regionCode: "KRD",
      countryCode: "IQ",
      customerPhone,
      description: "Dukanly checkout payment",
      lineItems,
    });

    if (!result.ok) {
      toast({
        title: "Checkout failed",
        description: result.failure?.message ?? "Could not submit checkout request.",
        variant: "destructive",
      });
      setIsPlacingOrder(false);
      return;
    }

    if (result.data.paymentMethod === "fib" && result.data.fib) {
      navigate(`/checkout/payment/${result.data.orderId}`, {
        state: {
          payment: result.data,
        },
      });
      setIsPlacingOrder(false);
      return;
    }

    clearCart();
    navigate("/order-confirmation", {
      state: {
        order: result.data,
      },
    });
  };

  if (activeItems.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add items to your cart before checking out.
            </p>
            <Button asChild className="btn-cta">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Checkout Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Shipping Address */}
            <section className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                    1
                  </span>
                  Shipping Address
                </h2>
                <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newAddress.name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, street: e.target.value })
                          }
                          placeholder="123 Main St, Apt 4B"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, city: e.target.value })
                            }
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, state: e.target.value })
                            }
                            placeholder="NY"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={newAddress.zip}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, zip: e.target.value })
                            }
                            placeholder="10001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={newAddress.country}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, country: e.target.value })
                            }
                            disabled
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => setIsAddAddressOpen(false)}
                      >
                        Save Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <RadioGroup
                value={selectedAddressId}
                onValueChange={setSelectedAddressId}
                className="space-y-3"
              >
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={address.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{address.name}</span>
                        {address.isDefault && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zip}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {/* Delivery Instructions */}
              <div className="mt-4 pt-4 border-t border-border">
                <Label htmlFor="instructions" className="text-sm font-medium">
                  Delivery Instructions (optional)
                </Label>
                <Input
                  id="instructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g., Leave at door, ring doorbell"
                  className="mt-2"
                />
              </div>
            </section>

            {/* 2. Delivery Options */}
            <section className="bg-card border border-border rounded-lg p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                  2
                </span>
                Delivery Options
              </h2>

              <RadioGroup
                value={selectedDelivery}
                onValueChange={setSelectedDelivery}
                className="space-y-3"
              >
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDelivery === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={option.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {option.id === "next-day" ? (
                            <Clock className="w-4 h-4 text-prime" />
                          ) : option.id === "express" ? (
                            <Truck className="w-4 h-4 text-info" />
                          ) : (
                            <Package className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{option.name}</span>
                        </div>
                        <span className="font-semibold">
                          {option.price === 0 ? (
                            <span className="text-success">FREE</span>
                          ) : (
                            `$${option.price.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description} • {option.estimatedDays}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {subtotal >= 35 && (
                <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Your order qualifies for FREE standard shipping!
                </div>
              )}
            </section>

            {/* 3. Payment Method */}
            <section className="bg-card border border-border rounded-lg p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                  3
                </span>
                Payment Method
              </h2>

              <RadioGroup
                value={selectedPaymentId}
                onValueChange={(value) => setSelectedPaymentId(value as "fib" | "cod")}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentId === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {method.type === "fib" ? (
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{method.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {selectedPaymentId === "cod" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Label htmlFor="customer-phone" className="text-sm font-medium">
                    Phone Number for COD verification
                  </Label>
                  <Input
                    id="customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+9647XXXXXXXX"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Launch risk controls require a valid delivery phone number for COD orders.
                  </p>
                </div>
              )}

              {/* Gift Card / Promo Code */}
              <div className="mt-4 pt-4 border-t border-border">
                <Label htmlFor="promo" className="text-sm font-medium">
                  Gift Card or Promo Code
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input id="promo" placeholder="Enter code" className="flex-1" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </section>

            {/* 4. Gift Options */}
            <section className="bg-card border border-border rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={isGiftOrder}
                  onCheckedChange={(checked) => setIsGiftOrder(checked as boolean)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">This order is a gift</span>
                  <p className="text-sm text-muted-foreground">
                    Price will not be shown on the packing slip
                  </p>
                </div>
              </label>

              {isGiftOrder && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Label htmlFor="gift-message" className="text-sm font-medium">
                    Gift Message (optional)
                  </Label>
                  <textarea
                    id="gift-message"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {giftMessage.length}/200 characters
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 sticky top-24">
              <h2 className="font-semibold">Order Summary</h2>

              {/* Items Preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-12 object-contain bg-secondary rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {Math.round(item.product.offer.price * item.quantity * exchangeRateUsdToIqd).toLocaleString()} IQD
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{Math.round(subtotal * exchangeRateUsdToIqd).toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `${Math.round(shippingCost * exchangeRateUsdToIqd).toLocaleString()} IQD`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (estimated)</span>
                  <span>{Math.round(taxAmount * exchangeRateUsdToIqd).toLocaleString()} IQD</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Order Total</span>
                  <span>{orderTotalIqd.toLocaleString()} IQD</span>
                </div>
              </div>

              {/* Selected Address Summary */}
              {selectedAddress && (
                <div className="text-xs text-muted-foreground border-t border-border pt-4">
                  <p className="font-medium text-foreground mb-1">Delivering to:</p>
                  <p>{selectedAddress.name}</p>
                  <p>{selectedAddress.street}</p>
                  <p>
                    {selectedAddress.city}, {selectedAddress.state}{" "}
                    {selectedAddress.zip}
                  </p>
                </div>
              )}

              <Button
                className="w-full btn-cta"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  "Processing..."
                ) : (
                  <>Place Order</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our{" "}
                <Link to="/terms" className="text-info hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-info hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Trust Signals */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Secure SSL encryption
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  30-day returns on most items
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
