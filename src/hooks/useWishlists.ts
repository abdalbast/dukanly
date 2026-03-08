import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Wishlist {
  id: string;
  name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
  product_ids: string[];
}

const QUERY_KEY = "wishlists";

export function useWishlists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: lists, error } = await supabase
        .from("wishlists")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch items for all lists
      const listIds = (lists ?? []).map((l: any) => l.id);
      let itemsByList: Record<string, string[]> = {};
      if (listIds.length > 0) {
        const { data: items } = await supabase
          .from("wishlist_items")
          .select("wishlist_id, product_id")
          .in("wishlist_id", listIds);
        for (const item of items ?? []) {
          const wid = (item as any).wishlist_id;
          const pid = (item as any).product_id;
          if (!itemsByList[wid]) itemsByList[wid] = [];
          itemsByList[wid].push(pid);
        }
      }

      return (lists ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        is_private: l.is_private,
        created_at: l.created_at,
        updated_at: l.updated_at,
        item_count: (itemsByList[l.id] ?? []).length,
        product_ids: itemsByList[l.id] ?? [],
      })) as Wishlist[];
    },
  });

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("wishlists")
        .insert({ name, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
    onError: () => toast({ title: "Error", description: "Could not create list.", variant: "destructive" }),
  });

  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase.from("wishlists").delete().eq("id", listId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
    onError: () => toast({ title: "Error", description: "Could not delete list.", variant: "destructive" }),
  });

  const togglePrivacy = useMutation({
    mutationFn: async ({ listId, isPrivate }: { listId: string; isPrivate: boolean }) => {
      const { error } = await supabase.from("wishlists").update({ is_private: isPrivate }).eq("id", listId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const addItem = useMutation({
    mutationFn: async ({ wishlistId, productId }: { wishlistId: string; productId: string }) => {
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ wishlist_id: wishlistId, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const removeItem = useMutation({
    mutationFn: async ({ wishlistId, productId }: { wishlistId: string; productId: string }) => {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("wishlist_id", wishlistId)
        .eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { wishlists, isLoading, createList, deleteList, togglePrivacy, addItem, removeItem };
}
