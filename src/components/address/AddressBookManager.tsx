import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddressBook } from "@/contexts/AddressBookContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  findGovernorate,
  findGovernorateForCity,
  getLocalizedCityLabel,
  getLocalizedGovernorateLabel,
  inferGovernorateFromLabel,
  KURDISTAN_COUNTRY,
  KURDISTAN_GOVERNORATES,
  normalizeIraqPhone,
} from "@/lib/kurdistan";
import type { AddressDraft, SavedAddress } from "@/types/address";

interface AddressBookManagerProps {
  mode?: "dialog" | "page";
  onSelectComplete?: () => void;
}

function createEmptyDraft(): AddressDraft {
  const defaultGovernorate = KURDISTAN_GOVERNORATES[0];
  return {
    name: "",
    phone: "+964",
    street: "",
    district: "",
    city: defaultGovernorate.cities[0]?.value ?? "",
    governorate: defaultGovernorate.value,
    landmark: "",
    postalCode: "",
    isDefault: false,
  };
}

function toDraft(address: SavedAddress): AddressDraft {
  return {
    name: address.name,
    phone: address.phone,
    street: address.street,
    district: address.district,
    city: address.city,
    governorate: address.governorate,
    landmark: address.landmark,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

function formatAddressLines(address: SavedAddress, language: "en" | "ckb") {
  return [
    address.street,
    address.district,
    `${getLocalizedCityLabel(address.city, address.governorate, language)}, ${getLocalizedGovernorateLabel(address.governorate, language)}`,
    address.landmark,
    address.postalCode,
    KURDISTAN_COUNTRY.label[language],
  ].filter(Boolean);
}

export function AddressBookManager({
  mode = "dialog",
  onSelectComplete,
}: AddressBookManagerProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    saveAddress,
    deleteAddress,
  } = useAddressBook();

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(createEmptyDraft);
  const [isFormOpen, setIsFormOpen] = useState(addresses.length === 0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const selectedGovernorate =
    findGovernorate(draft.governorate) ?? findGovernorateForCity(draft.city) ?? KURDISTAN_GOVERNORATES[0];
  const cityOptions = selectedGovernorate.cities;

  useEffect(() => {
    if (addresses.length === 0) {
      setIsFormOpen(true);
    }
  }, [addresses.length]);

  const formTitle = editingAddressId ? t("addressBook.editAddress") : t("checkout.addNewAddress");
  const savedAddressesLabel = useMemo(() => t("addressBook.savedAddresses"), [t]);

  const updateDraft = (field: keyof AddressDraft, value: string | boolean) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingAddressId(null);
    setDraft(createEmptyDraft());
    setIsFormOpen(addresses.length === 0);
  };

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setDraft(createEmptyDraft());
    setIsFormOpen(true);
  };

  const startGpsAddressCapture = () => {
    openNewAddressForm();
    window.setTimeout(() => {
      void handleDetectLocation();
    }, 0);
  };

  const openEditAddressForm = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setDraft(toDraft(address));
    setIsFormOpen(true);
  };

  const handleGovernorateChange = (governorate: string) => {
    const nextGovernorate = findGovernorate(governorate) ?? KURDISTAN_GOVERNORATES[0];
    setDraft((current) => ({
      ...current,
      governorate: nextGovernorate.value,
      city: nextGovernorate.cities[0]?.value ?? current.city,
    }));
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: t("checkout.gpsNotSupported"),
        description: t("checkout.gpsNotSupportedDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=${language === "ckb" ? "ckb,en" : "en"}`,
            { headers: { "User-Agent": "Dukanly/1.0" } },
          );
          const data = await response.json();
          const address = data.address ?? {};
          const governorateValue =
            inferGovernorateFromLabel(address.state ?? address.region ?? address.county) ??
            findGovernorateForCity(address.city ?? address.town ?? address.village)?.value ??
            KURDISTAN_GOVERNORATES[0].value;
          const governorate = findGovernorate(governorateValue) ?? KURDISTAN_GOVERNORATES[0];
          const city = address.city ?? address.town ?? address.village ?? governorate.cities[0]?.value ?? "";

          setDraft((current) => ({
            ...current,
            street: [address.house_number, address.road].filter(Boolean).join(" ") || address.road || "",
            district:
              address.suburb ??
              address.neighbourhood ??
              address.residential ??
              address.city_district ??
              current.district,
            city,
            governorate: governorate.value,
            landmark: address.amenity ?? address.shop ?? current.landmark,
            postalCode: address.postcode ?? current.postalCode,
          }));

          toast({
            title: t("checkout.locationDetected"),
            description: `${city}, ${governorate.label[language]}`,
          });
        } catch {
          toast({
            title: t("checkout.geocodingFailed"),
            description: t("checkout.geocodingFailedDesc"),
            variant: "destructive",
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: t("checkout.permissionDenied"),
            description: t("checkout.permissionDeniedDesc"),
            variant: "destructive",
          });
          return;
        }

        toast({
          title: t("checkout.locationError"),
          description: error.message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSave = () => {
    const normalizedPhone = normalizeIraqPhone(draft.phone);
    const normalizedDraft: AddressDraft = {
      ...draft,
      name: draft.name.trim(),
      phone: normalizedPhone ?? "",
      street: draft.street.trim(),
      district: draft.district.trim(),
      city: draft.city.trim(),
      governorate: draft.governorate.trim(),
      landmark: draft.landmark.trim(),
      postalCode: draft.postalCode.trim(),
    };

    if (
      !normalizedDraft.name ||
      !normalizedDraft.street ||
      !normalizedDraft.district ||
      !normalizedDraft.city ||
      !normalizedDraft.governorate
    ) {
      toast({
        title: t("checkout.missingAddressDetails"),
        description: t("checkout.completeAddressDetails"),
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

    saveAddress(normalizedDraft, editingAddressId);
    toast({
      title: editingAddressId ? t("addressBook.addressUpdated") : t("addressBook.addressSaved"),
    });
    resetForm();
  };

  const handleDelete = (addressId: string) => {
    deleteAddress(addressId);
    if (editingAddressId === addressId) {
      resetForm();
    }
    toast({ title: t("addressBook.addressDeleted") });
  };

  const handleSelect = (addressId: string) => {
    selectAddress(addressId);
    toast({ title: t("addressBook.selected") });
    onSelectComplete?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {mode === "page" && <h1 className="text-2xl font-bold">{t("account.yourAddresses")}</h1>}
          <p className="text-sm text-muted-foreground">
            {mode === "page" ? t("addressBook.subtitle") : t("checkout.kurdistanAddressHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={startGpsAddressCapture}>
            <Navigation className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("checkout.useMyLocation")}
          </Button>
          <Button onClick={openNewAddressForm}>
            <Plus className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("addressBook.addAddress")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-3">
          <div className="text-sm font-medium">{savedAddressesLabel}</div>
          {addresses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">{t("addressBook.noAddresses")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("addressBook.noAddressesDesc")}</p>
            </div>
          ) : (
            addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;
              return (
                <div
                  key={address.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{address.name}</p>
                        {address.isDefault && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                            {t("common.default")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                        {address.phone}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                        {t("addressBook.selected")}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {formatAddressLines(address, language).map((line) => (
                      <p key={`${address.id}-${line}`}>{line}</p>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={isSelected ? "secondary" : "default"}
                      onClick={() => handleSelect(address.id)}
                    >
                      {isSelected ? t("addressBook.selected") : t("addressBook.deliverHere")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditAddressForm(address)}>
                      <Pencil className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {isFormOpen && (
          <section className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{formTitle}</h2>
              {addresses.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  {t("common.cancel")}
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
            >
              <Navigation className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {isDetectingLocation ? t("checkout.detectingLocation") : t("checkout.useMyLocation")}
            </Button>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-name">{t("checkout.fullName")}</Label>
                <Input
                  id="address-name"
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  placeholder={t("checkout.fullNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="address-phone">{t("checkout.contactPhone")}</Label>
                <Input
                  id="address-phone"
                  dir="ltr"
                  value={draft.phone}
                  onChange={(event) => updateDraft("phone", event.target.value)}
                  placeholder={t("checkout.contactPhonePlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-governorate">{t("checkout.governorate")}</Label>
                <Select value={draft.governorate} onValueChange={handleGovernorateChange}>
                  <SelectTrigger id="address-governorate">
                    <SelectValue placeholder={t("checkout.governorate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {KURDISTAN_GOVERNORATES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address-city">{t("checkout.city")}</Label>
                <Select value={draft.city} onValueChange={(value) => updateDraft("city", value)}>
                  <SelectTrigger id="address-city">
                    <SelectValue placeholder={t("checkout.city")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address-street">{t("checkout.streetAddress")}</Label>
              <Input
                id="address-street"
                value={draft.street}
                onChange={(event) => updateDraft("street", event.target.value)}
                placeholder={t("checkout.streetAddressPlaceholder")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-district">{t("checkout.neighborhood")}</Label>
                <Input
                  id="address-district"
                  value={draft.district}
                  onChange={(event) => updateDraft("district", event.target.value)}
                  placeholder={t("checkout.neighborhoodPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="address-landmark">{t("checkout.landmark")}</Label>
                <Input
                  id="address-landmark"
                  value={draft.landmark}
                  onChange={(event) => updateDraft("landmark", event.target.value)}
                  placeholder={t("checkout.landmarkPlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-postal">{t("checkout.postalCodeOptional")}</Label>
                <Input
                  id="address-postal"
                  value={draft.postalCode}
                  onChange={(event) => updateDraft("postalCode", event.target.value)}
                  placeholder="44001"
                />
              </div>
              <div>
                <Label htmlFor="address-country">{t("checkout.country")}</Label>
                <Input id="address-country" value={KURDISTAN_COUNTRY.label[language]} disabled />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={draft.isDefault}
                onCheckedChange={(checked) => updateDraft("isDefault", Boolean(checked))}
                className="mt-1"
              />
              <div>
                <span className="font-medium">{t("addressBook.setAsDefault")}</span>
                <p className="text-sm text-muted-foreground">{t("addressBook.defaultHint")}</p>
              </div>
            </label>

            <Button className="w-full" onClick={handleSave}>
              {t("checkout.saveAddress")}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
