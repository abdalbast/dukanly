import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithOffer } from "@/types/product";

interface DbProduct {
  id: string;
  seller_id: string;
  sku: string;
  title: string;
  description: string | null;
  status: string;
  currency_code: string;
  base_price: number;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  images: string[];
  rating: number;
  review_count: number;
  is_prime: boolean;
  is_best_seller: boolean;
  is_limited_deal: boolean;
  stock: number;
  original_price: number | null;
  delivery_days: number;
  fulfillment_type: string;
  sellers: { id: string; store_name: string } | null;
}

function mapDbToProduct(row: DbProduct): ProductWithOffer {
  const seller = row.sellers;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    images: Array.isArray(row.images) ? row.images : ["/placeholder.svg"],
    category: row.category ?? "",
    subcategory: row.subcategory ?? undefined,
    brand: row.brand ?? "",
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    isPrime: row.is_prime ?? false,
    isBestSeller: row.is_best_seller ?? false,
    isLimitedDeal: row.is_limited_deal ?? false,
    offer: {
      id: `offer-${row.id}`,
      productId: row.id,
      sellerId: row.seller_id,
      sellerName: seller?.store_name ?? "Marketplace",
      price: Number(row.base_price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      currency: row.currency_code,
      stock: row.stock ?? 0,
      fulfillmentType: (row.fulfillment_type as "seller" | "marketplace") ?? "seller",
      deliveryDays: row.delivery_days ?? 3,
      condition: "new" as const,
    },
  };
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, sellers(id, store_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as DbProduct[]).map(mapDbToProduct);
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*, sellers(id, store_name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return mapDbToProduct(data as unknown as DbProduct);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*, sellers(id, store_name)")
        .eq("status", "active")
        .eq("category", category)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as DbProduct[]).map(mapDbToProduct);
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      if (!query) {
        const { data, error } = await supabase
          .from("products")
          .select("*, sellers(id, store_name)")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data as unknown as DbProduct[]).map(mapDbToProduct);
      }
      const pattern = `%${query}%`;
      const { data, error } = await supabase
        .from("products")
        .select("*, sellers(id, store_name)")
        .eq("status", "active")
        .or(`title.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as DbProduct[]).map(mapDbToProduct);
    },
    staleTime: 1000 * 60 * 2,
  });
}
