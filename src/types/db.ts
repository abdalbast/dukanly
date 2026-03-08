/**
 * Canonical interface for rows returned from the `products` table.
 * Both storefront (useProducts) and seller hooks share this single source of truth.
 * The optional `sellers` join is included when the query uses `select("*, sellers(…)")`.
 */
export interface DbProduct {
  id: string;
  seller_id: string;
  sku: string;
  title: string;
  description: string | null;
  status: string;
  currency_code: string;
  base_price: number;
  original_price: number | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  images: string[];
  rating: number | null;
  review_count: number | null;
  is_prime: boolean | null;
  is_best_seller: boolean | null;
  is_limited_deal: boolean | null;
  stock: number | null;
  delivery_days: number | null;
  fulfillment_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  /** Present only when joined via `sellers(id, store_name)` */
  sellers?: { id: string; store_name: string } | null;
}
