import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { upsertSellerProduct } from "@/lib/writeApi";
import type { SellerProduct } from "@/types/seller";
import type { DbProduct } from "@/types/db";

function mapDbToSellerProduct(row: DbProduct): SellerProduct {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description ?? "",
    images: Array.isArray(row.images) ? row.images : [],
    category: row.category ?? "",
    subcategory: row.subcategory ?? undefined,
    brand: row.brand ?? "",
    sku: row.sku,
    price: Number(row.base_price),
    compareAtPrice: row.original_price ? Number(row.original_price) : undefined,
    stock: row.stock ?? 0,
    lowStockThreshold: 20,
    status: (row.status as "active" | "draft" | "archived") ?? "draft",
    tags: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useSellerProducts(sellerId: string | null) {
  const [products, setProducts] = useState<SellerProduct[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!sellerId) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setProducts((data as unknown as DbProduct[]).map(mapDbToSellerProduct));
    }
  }, [sellerId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = useCallback(
    async (product: Omit<SellerProduct, "id" | "sellerId" | "createdAt" | "updatedAt">) => {
      const write = await upsertSellerProduct({
        sku: product.sku, title: product.title, description: product.description,
        status: product.status, currencyCode: "IQD", basePrice: product.price,
      });
      if (!write.ok) throw new Error(write.failure?.message ?? "Failed to add product.");
      await fetchProducts();
    },
    [fetchProducts],
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<SellerProduct>) => {
      const existing = products.find((p) => p.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updates };
      const write = await upsertSellerProduct({
        sku: merged.sku, title: merged.title, description: merged.description,
        status: merged.status, currencyCode: "IQD", basePrice: merged.price,
      });
      if (!write.ok) throw new Error(write.failure?.message ?? "Failed to update product.");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    },
    [products],
  );

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message ?? "Failed to delete product.");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
}
