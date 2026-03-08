export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  isPrime: boolean;
  isBestSeller?: boolean;
  isLimitedDeal?: boolean;
  isHandmade?: boolean;
  isArtisanBrand?: boolean;
}

export interface Offer {
  id: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stock: number;
  fulfillmentType: 'seller' | 'marketplace';
  deliveryDays: number;
  condition: 'new' | 'renewed' | 'used';
}

export interface ProductWithOffer extends Product {
  offer: Offer;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  subcategories?: Category[];
}

export interface CartItem {
  id: string;
  product: ProductWithOffer;
  quantity: number;
  savedForLater: boolean;
  isGift: boolean;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  logo?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}
