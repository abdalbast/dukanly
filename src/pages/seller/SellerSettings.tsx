import { useState, useEffect } from "react";
import { useSeller } from "@/contexts/SellerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Store, Bell, Truck, CreditCard, Shield, ImagePlus, Save } from "lucide-react";

export default function SellerSettings() {
  const { profile, updateProfile, settings, updateSettings } = useSeller();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    storeName: profile.storeName,
    storeDescription: profile.storeDescription,
    email: profile.email,
    phone: profile.phone || "",
    street: profile.address.street,
    city: profile.address.city,
    state: profile.address.state,
    zip: profile.address.zip,
  });

  // Sync form when profile loads from DB
  useEffect(() => {
    setProfileForm({
      storeName: profile.storeName,
      storeDescription: profile.storeDescription,
      email: profile.email,
      phone: profile.phone || "",
      street: profile.address.street,
      city: profile.address.city,
      state: profile.address.state,
      zip: profile.address.zip,
    });
  }, [profile]);

  const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
  const [shippingSettings, setShippingSettings] = useState(settings.shipping);
  const [paymentSettings, setPaymentSettings] = useState(settings.payments);

  const handleSaveProfile = async () => {
    await updateProfile({
      storeName: profileForm.storeName,
      storeDescription: profileForm.storeDescription,
      email: profileForm.email,
      phone: profileForm.phone || undefined,
      address: {
        street: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zip: profileForm.zip,
        country: profile.address.country,
      },
    });
    toast({ title: "Profile updated", description: "Your store profile has been saved" });
  };

  const handleSaveNotifications = () => {
    updateSettings({ notifications: notificationSettings });
    toast({ title: "Notifications updated", description: "Your notification preferences have been saved" });
  };

  const handleSaveShipping = () => {
    updateSettings({ shipping: shippingSettings });
    toast({ title: "Shipping settings updated", description: "Your shipping preferences have been saved" });
  };

  const handleSavePayments = async () => {
    await updateSettings({ payments: paymentSettings });
    toast({ title: "Payment settings updated", description: "Your payment preferences have been saved" });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2"><Store className="w-4 h-4" /><span className="hidden sm:inline">Profile</span></TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="w-4 h-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2"><Truck className="w-4 h-4" /><span className="hidden sm:inline">Shipping</span></TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2"><CreditCard className="w-4 h-4" /><span className="hidden sm:inline">Payments</span></TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>This information will be displayed to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {profile.logo ? (
                  <img src={profile.logo} alt="Store logo" className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 200x200px</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" value={profileForm.storeName} onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Store Description</Label>
                <Textarea id="description" value={profileForm.storeDescription} onChange={(e) => setProfileForm({ ...profileForm, storeDescription: e.target.value })} rows={3} />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+964 750 123 4567" />
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" value={profileForm.street} onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">Governorate</Label>
                      <Input id="state" value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="zip">Postal Code</Label>
                      <Input id="zip" value={profileForm.zip} onChange={(e) => setProfileForm({ ...profileForm, zip: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{profile.isVerified ? "Verified Seller" : "Verification Pending"}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.isVerified ? "Your business has been verified" : "Complete your business verification to unlock more features"}
                  </p>
                </div>
                {profile.isVerified ? (
                  <div className="flex items-center gap-2 text-success"><Shield className="w-5 h-5" /><span className="font-medium">Verified</span></div>
                ) : (
                  <Button>Complete Verification</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about store activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "orderAlerts" as const, title: "Order Alerts", desc: "Get notified when you receive a new order" },
                { key: "lowStockAlerts" as const, title: "Low Stock Alerts", desc: "Get notified when products are running low" },
                { key: "reviewAlerts" as const, title: "Review Alerts", desc: "Get notified when customers leave reviews" },
                { key: "marketingEmails" as const, title: "Marketing Emails", desc: "Receive tips and promotional opportunities" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[item.key]}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                  />
                </div>
              ))}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveNotifications}><Save className="w-4 h-4 mr-2" />Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure your shipping and fulfillment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShipping">Free Shipping Threshold (IQD)</Label>
                  <Input
                    id="freeShipping" type="number"
                    value={shippingSettings.freeShippingThreshold || ""}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="e.g., 50000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <Label htmlFor="handlingTime">Handling Time (days)</Label>
                  <Select value={shippingSettings.handlingTime.toString()} onValueChange={(value) => setShippingSettings({ ...shippingSettings, handlingTime: parseInt(value) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea id="returnPolicy" value={shippingSettings.returnPolicy} onChange={(e) => setShippingSettings({ ...shippingSettings, returnPolicy: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveShipping}><Save className="w-4 h-4 mr-2" />Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Manage how you receive your payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payout Method</Label>
                  <Select value={paymentSettings.payoutMethod} onValueChange={(value: "bank" | "paypal") => setPaymentSettings({ ...paymentSettings, payoutMethod: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payout Schedule</Label>
                  <Select value={paymentSettings.payoutSchedule} onValueChange={(value: "daily" | "weekly" | "monthly") => setPaymentSettings({ ...paymentSettings, payoutSchedule: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentSettings.payoutMethod === "bank" && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={paymentSettings.bankAccount?.bankName || ""}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          bankAccount: { bankName: e.target.value, accountLast4: paymentSettings.bankAccount?.accountLast4 || "" },
                        })}
                      />
                    </div>
                    <div>
                      <Label>Account (Last 4 Digits)</Label>
                      <Input
                        value={paymentSettings.bankAccount?.accountLast4 || ""}
                        maxLength={4}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          bankAccount: { bankName: paymentSettings.bankAccount?.bankName || "", accountLast4: e.target.value },
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSavePayments}><Save className="w-4 h-4 mr-2" />Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
