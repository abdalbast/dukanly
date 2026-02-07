export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  logo?: string;
  bannerImage?: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  businessType: 'individual' | 'business';
  taxId?: string;
  isVerified: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft' | 'archived';
  variants?: ProductVariant[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  sellerId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: SellerOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  viewsChange: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; title: string; sales: number; revenue: number }[];
  recentOrders: SellerOrder[];
  ordersByStatus: { status: string; count: number }[];
}

export interface SellerSettings {
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    reviewAlerts: boolean;
    marketingEmails: boolean;
  };
  shipping: {
    freeShippingThreshold?: number;
    handlingTime: number;
    returnPolicy: string;
  };
  payments: {
    payoutMethod: 'bank' | 'paypal';
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    bankAccount?: {
      bankName: string;
      accountLast4: string;
    };
  };
}
