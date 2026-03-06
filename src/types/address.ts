export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  governorate: string;
  landmark: string;
  postalCode: string;
  countryCode: "IQ";
  isDefault: boolean;
}

export interface AddressDraft {
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  governorate: string;
  landmark: string;
  postalCode: string;
  isDefault: boolean;
}
