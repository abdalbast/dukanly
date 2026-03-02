export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country_code: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          kind: string
          line1: string
          line2: string | null
          phone: string | null
          postal_code: string | null
          state_region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country_code?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          kind?: string
          line1: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state_region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country_code?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          kind?: string
          line1?: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          request_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency_code: string
          expires_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity_on_hand: number
          reorder_point: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity_on_hand?: number
          reorder_point?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity_on_hand?: number
          reorder_point?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_ref: string | null
          quantity: number
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_ref?: string | null
          quantity?: number
          state?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_ref?: string | null
          quantity?: number
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          line_total: number | null
          order_id: string
          product_id: string | null
          product_ref: string | null
          quantity: number
          seller_id: string | null
          tax_amount: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          line_total?: number | null
          order_id: string
          product_id?: string | null
          product_ref?: string | null
          quantity?: number
          seller_id?: string | null
          tax_amount?: number | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          line_total?: number | null
          order_id?: string
          product_id?: string | null
          product_ref?: string | null
          quantity?: number
          seller_id?: string | null
          tax_amount?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string
          currency_code: string
          fulfillment_status: string
          id: string
          order_number: string
          payment_method: string | null
          payment_state: string | null
          payment_state_reason: string | null
          payment_status: string
          region_code: string | null
          shipping_address_id: string | null
          shipping_amount: number | null
          source_cart_id: string | null
          status: string
          subtotal_amount: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string
          currency_code?: string
          fulfillment_status?: string
          id?: string
          order_number: string
          payment_method?: string | null
          payment_state?: string | null
          payment_state_reason?: string | null
          payment_status?: string
          region_code?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number | null
          source_cart_id?: string | null
          status?: string
          subtotal_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string
          currency_code?: string
          fulfillment_status?: string
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_state?: string | null
          payment_state_reason?: string | null
          payment_status?: string
          region_code?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number | null
          source_cart_id?: string | null
          status?: string
          subtotal_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_state_log: {
        Row: {
          created_at: string
          from_state: string | null
          id: string
          payment_id: string
          provider_status: string | null
          raw_payload: Json | null
          source: string | null
          to_state: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          from_state?: string | null
          id?: string
          payment_id: string
          provider_status?: string | null
          raw_payload?: Json | null
          source?: string | null
          to_state: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          from_state?: string | null
          id?: string
          payment_id?: string
          provider_status?: string | null
          raw_payload?: Json | null
          source?: string | null
          to_state?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_state_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          id: string
          idempotency_key: string | null
          order_id: string
          processed_at: string | null
          provider: string
          provider_payment_id: string | null
          provider_status: string | null
          raw_provider_payload: Json | null
          status: string
          status_callback_url: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string
          id?: string
          idempotency_key?: string | null
          order_id: string
          processed_at?: string | null
          provider: string
          provider_payment_id?: string | null
          provider_status?: string | null
          raw_provider_payload?: Json | null
          status?: string
          status_callback_url?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          id?: string
          idempotency_key?: string | null
          order_id?: string
          processed_at?: string | null
          provider?: string
          provider_payment_id?: string | null
          provider_status?: string | null
          raw_provider_payload?: Json | null
          status?: string
          status_callback_url?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          product_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          id?: string
          product_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          product_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          brand: string | null
          category: string | null
          created_at: string
          currency_code: string
          delivery_days: number | null
          description: string | null
          fulfillment_type: string | null
          id: string
          images: Json | null
          is_best_seller: boolean | null
          is_limited_deal: boolean | null
          is_prime: boolean | null
          metadata: Json | null
          original_price: number | null
          rating: number | null
          review_count: number | null
          seller_id: string
          sku: string
          status: string
          stock: number | null
          subcategory: string | null
          title: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          brand?: string | null
          category?: string | null
          created_at?: string
          currency_code?: string
          delivery_days?: number | null
          description?: string | null
          fulfillment_type?: string | null
          id?: string
          images?: Json | null
          is_best_seller?: boolean | null
          is_limited_deal?: boolean | null
          is_prime?: boolean | null
          metadata?: Json | null
          original_price?: number | null
          rating?: number | null
          review_count?: number | null
          seller_id: string
          sku: string
          status?: string
          stock?: number | null
          subcategory?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          brand?: string | null
          category?: string | null
          created_at?: string
          currency_code?: string
          delivery_days?: number | null
          description?: string | null
          fulfillment_type?: string | null
          id?: string
          images?: Json | null
          is_best_seller?: boolean | null
          is_limited_deal?: boolean | null
          is_prime?: boolean | null
          metadata?: Json | null
          original_price?: number | null
          rating?: number | null
          review_count?: number | null
          seller_id?: string
          sku?: string
          status?: string
          stock?: number | null
          subcategory?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          client_ip: string
          request_count: number
          route_key: string
          window_start: string
        }
        Insert: {
          client_ip: string
          request_count?: number
          route_key: string
          window_start: string
        }
        Update: {
          client_ip?: string
          request_count?: number
          route_key?: string
          window_start?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean
          store_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean
          store_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          order_id: string
          seller_id: string | null
          service_level: string | null
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id: string
          seller_id?: string | null
          service_level?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id?: string
          seller_id?: string | null
          service_level?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      sellers_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          store_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          store_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          store_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_client_ip: string
          p_max_requests?: number
          p_route_key: string
          p_window_ms?: number
        }
        Returns: boolean
      }
      is_seller: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
