import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithOffer } from "@/types/product";
import type { DbProduct } from "@/types/db";
import pelinSoapBarsImage from "@/assets/pelin/0T7A0075.webp";
import pelinBodyWashImage from "@/assets/pelin/0T7A0072.webp";
import pelinGiftBasketImage from "@/assets/pelin/0T7A0070.webp";
import pelinHairCleanserImage from "@/assets/pelin/0T7A0091.webp";

function resolvePelinFallbackImages(row: DbProduct): string[] {
  if ((row.brand ?? "").toLowerCase() !== "pelin products") return [];

  const fingerprint = `${row.sku} ${row.title}`.toLowerCase();
  if (fingerprint.includes("turmeric") || fingerprint.includes("soap bars")) {
    return [pelinSoapBarsImage];
  }
  if (fingerprint.includes("body wash") || fingerprint.includes("purifying")) {
    return [pelinBodyWashImage];
  }
  if (fingerprint.includes("gift basket") || fingerprint.includes("5 piece")) {
    return [pelinGiftBasketImage];
  }
  if (fingerprint.includes("hair cleanser") || fingerprint.includes("olive") || fingerprint.includes("laurel")) {
    return [pelinHairCleanserImage, pelinBodyWashImage];
  }

  return [pelinGiftBasketImage];
}

function mapDbToProduct(row: DbProduct): ProductWithOffer {
  const seller = row.sellers;
  const normalizedImages = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  const fallbackImages = resolvePelinFallbackImages(row);
  const images =
    normalizedImages.length > 0
      ? normalizedImages
      : fallbackImages.length > 0
        ? fallbackImages
        : ["/placeholder.svg"];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    images,
    category: row.category ?? "",
    subcategory: row.subcategory ?? undefined,
    brand: row.brand ?? "",
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    isPrime: row.is_prime ?? false,
    isBestSeller: row.is_best_seller ?? false,
    isLimitedDeal: row.is_limited_deal ?? false,
    isHandmade: row.is_handmade ?? false,
    isArtisanBrand: row.is_artisan_brand ?? false,
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
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
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
