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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string
          password_hash: string
          permissions: string[] | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name: string
          password_hash: string
          permissions?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string
          password_hash?: string
          permissions?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          default_shipping_address: string | null
          default_shipping_city: string | null
          default_shipping_postal_code: string | null
          default_shipping_province: string | null
          email: string
          email_verified: boolean | null
          facebook_id: string | null
          first_name: string
          google_id: string | null
          id: string
          last_login_at: string | null
          last_name: string
          marketing_emails: boolean | null
          newsletter_subscribed: boolean | null
          password_hash: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_shipping_address?: string | null
          default_shipping_city?: string | null
          default_shipping_postal_code?: string | null
          default_shipping_province?: string | null
          email: string
          email_verified?: boolean | null
          facebook_id?: string | null
          first_name: string
          google_id?: string | null
          id?: string
          last_login_at?: string | null
          last_name: string
          marketing_emails?: boolean | null
          newsletter_subscribed?: boolean | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_shipping_address?: string | null
          default_shipping_city?: string | null
          default_shipping_postal_code?: string | null
          default_shipping_province?: string | null
          email?: string
          email_verified?: boolean | null
          facebook_id?: string | null
          first_name?: string
          google_id?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string
          marketing_emails?: boolean | null
          newsletter_subscribed?: boolean | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          customer_email: string | null
          discount_percentage: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_used: boolean | null
          last_order_id: string | null
          max_uses: number
          order_id: string | null
          times_used: number
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          customer_email?: string | null
          discount_percentage: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_used?: boolean | null
          last_order_id?: string | null
          max_uses?: number
          order_id?: string | null
          times_used?: number
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          customer_email?: string | null
          discount_percentage?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_used?: boolean | null
          last_order_id?: string | null
          max_uses?: number
          order_id?: string | null
          times_used?: number
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_last_order_id_fkey"
            columns: ["last_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_applications: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          business_name: string | null
          certifications: string | null
          city: string
          created_at: string | null
          description: string
          email: string
          extra_image_path: string | null
          farming_experience: number
          first_name: string
          hectares: number | null
          id: string
          last_name: string
          main_products: string
          notes: string | null
          phone: string
          poduct_image_path: string | null
          postal_code: string
          production_type: string
          profile_image_path: string | null
          province: string
          rejection_reason: string | null
          social_media: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          certifications?: string | null
          city: string
          created_at?: string | null
          description: string
          email: string
          extra_image_path?: string | null
          farming_experience: number
          first_name: string
          hectares?: number | null
          id?: string
          last_name: string
          main_products: string
          notes?: string | null
          phone: string
          poduct_image_path?: string | null
          postal_code: string
          production_type: string
          profile_image_path?: string | null
          province: string
          rejection_reason?: string | null
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          certifications?: string | null
          city?: string
          created_at?: string | null
          description?: string
          email?: string
          extra_image_path?: string | null
          farming_experience?: number
          first_name?: string
          hectares?: number | null
          id?: string
          last_name?: string
          main_products?: string
          notes?: string | null
          phone?: string
          poduct_image_path?: string | null
          postal_code?: string
          production_type?: string
          profile_image_path?: string | null
          province?: string
          rejection_reason?: string | null
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_applications_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          business_name: string | null
          certifications: string[] | null
          city: string
          coordinates: string | null
          cover_image_url: string | null
          created_at: string
          customers_served: number | null
          description: string | null
          email: string
          first_name: string
          hectares: number | null
          id: string
          last_name: string
          phone: string | null
          postal_code: string
          production_type: string | null
          profile_image_url: string | null
          province: string
          short_description: string | null
          social_media: Json | null
          specialties: string[] | null
          status: string | null
          story: string | null
          updated_at: string
          verified: boolean | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          certifications?: string[] | null
          city: string
          coordinates?: string | null
          cover_image_url?: string | null
          created_at?: string
          customers_served?: number | null
          description?: string | null
          email: string
          first_name: string
          hectares?: number | null
          id?: string
          last_name: string
          phone?: string | null
          postal_code: string
          production_type?: string | null
          profile_image_url?: string | null
          province: string
          short_description?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          status?: string | null
          story?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          certifications?: string[] | null
          city?: string
          coordinates?: string | null
          cover_image_url?: string | null
          created_at?: string
          customers_served?: number | null
          description?: string | null
          email?: string
          first_name?: string
          hectares?: number | null
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string
          production_type?: string | null
          profile_image_url?: string | null
          province?: string
          short_description?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          status?: string | null
          story?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean | null
          confirmed_at: string | null
          created_at: string
          customer_id: string | null
          email: string
          first_name: string | null
          frequency: string | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          last_email_sent_at: string | null
          last_name: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          first_name?: string | null
          frequency?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_email_sent_at?: string | null
          last_name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          first_name?: string | null
          frequency?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_email_sent_at?: string | null
          last_name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          farmer_id: string | null
          farmer_name: string
          id: string
          order_id: string | null
          product_description: string | null
          product_id: string | null
          product_image_url: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          farmer_id?: string | null
          farmer_name: string
          id?: string
          order_id?: string | null
          product_description?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          farmer_id?: string | null
          farmer_name?: string
          id?: string
          order_id?: string | null
          product_description?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_variants"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          status: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          status: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_first_name: string
          customer_id: string | null
          customer_last_name: string
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number | null
          discount_code_used: string | null
          estimated_delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost: number
          shipping_notes: string | null
          shipping_postal_code: string
          shipping_province: string
          status: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_first_name: string
          customer_id?: string | null
          customer_last_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          discount_code_used?: string | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost?: number
          shipping_notes?: string | null
          shipping_postal_code: string
          shipping_province: string
          status?: string | null
          subtotal: number
          tax_amount?: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_first_name?: string
          customer_id?: string | null
          customer_last_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          discount_code_used?: string | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_cost?: number
          shipping_notes?: string | null
          shipping_postal_code?: string
          shipping_province?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          description: string | null
          discount: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          unit: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          product_id: string
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_variants"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          farmer_id: string | null
          features: string[] | null
          gallery_images: string[] | null
          id: string
          is_available: boolean | null
          main_image_url: string
          max_order_quantity: number | null
          meta_description: string | null
          meta_title: string | null
          min_order_quantity: number | null
          name: string
          nutritional_info: string | null
          price: number | null
          requires_cold_shipping: boolean | null
          seasonality: string | null
          short_description: string | null
          slug: string | null
          storage_instructions: string | null
          subcategory: string | null
          tags: string[] | null
          unit: string | null
          updated_at: string
          weight_per_unit: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          farmer_id?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          is_available?: boolean | null
          main_image_url: string
          max_order_quantity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name: string
          nutritional_info?: string | null
          price?: number | null
          requires_cold_shipping?: boolean | null
          seasonality?: string | null
          short_description?: string | null
          slug?: string | null
          storage_instructions?: string | null
          subcategory?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          weight_per_unit?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          farmer_id?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          is_available?: boolean | null
          main_image_url?: string
          max_order_quantity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name?: string
          nutritional_info?: string | null
          price?: number | null
          requires_cold_shipping?: boolean | null
          seasonality?: string | null
          short_description?: string | null
          slug?: string | null
          storage_instructions?: string | null
          subcategory?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          weight_per_unit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      products_with_variants: {
        Row: {
          base_price: number | null
          category: string | null
          description: string | null
          main_image_url: string | null
          name: string | null
          product_id: string | null
          unit: string | null
          variant_id: string | null
          variant_name: string | null
          variant_price: number | null
          variant_weight: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_farmer_application: {
        Args: { admin_id: string; application_id: string }
        Returns: string
      }
      authenticate_admin: {
        Args: { p_email: string; p_password: string }
        Returns: {
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: string
        }[]
      }
      change_admin_password: {
        Args: {
          p_admin_id: string
          p_new_password: string
          p_old_password: string
        }
        Returns: boolean
      }
      create_admin: {
        Args: {
          p_created_by?: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_password: string
          p_role?: string
        }
        Returns: string
      }
      create_product_variant: {
        Args: {
          p_description: string
          p_discount: number
          p_is_active?: boolean
          p_name: string
          p_pieces: string
          p_price: number
          p_product_id: string
          p_sku: string
          p_unit: string
          p_weight: number
        }
        Returns: string
      }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_farmer_products: {
        Args: { farmer_id: string }
        Returns: {
          category: string
          created_at: string
          id: string
          is_available: boolean
          main_image_url: string
          name: string
          price: number
          stock_quantity: number
          unit: string
        }[]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      reject_farmer_application: {
        Args: { admin_id: string; application_id: string; reason?: string }
        Returns: boolean
      }
      update_product_variant: {
        Args: {
          p_description: string
          p_discount: number
          p_id: string
          p_is_active: boolean
          p_name: string
          p_pieces: string
          p_price: number
          p_sku: string
          p_unit: string
          p_weight: number
        }
        Returns: undefined
      }
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
