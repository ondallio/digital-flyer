export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      flyer_views: {
        Row: {
          id: string
          ip_hash: string | null
          referrer: string | null
          user_agent: string | null
          vendor_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          vendor_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
          vendor_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flyer_views_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          target_id: string | null
          target_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          target_id?: string | null
          target_type?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          target_id?: string | null
          target_type?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          discount_rate: number
          id: string
          image: string | null
          is_featured: boolean | null
          name: string
          original_price: number
          sale_end_date: string | null
          sale_price: number
          sale_start_date: string | null
          sort_order: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          discount_rate?: number
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name: string
          original_price: number
          sale_end_date?: string | null
          sale_price: number
          sale_start_date?: string | null
          sort_order?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          discount_rate?: number
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name?: string
          original_price?: number
          sale_end_date?: string | null
          sale_price?: number
          sale_start_date?: string | null
          sort_order?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          contact: string
          created_at: string | null
          email: string | null
          id: string
          manager_name: string
          memo: string | null
          shop_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          contact: string
          created_at?: string | null
          email?: string | null
          id?: string
          manager_name: string
          memo?: string | null
          shop_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          contact?: string
          created_at?: string | null
          email?: string | null
          id?: string
          manager_name?: string
          memo?: string | null
          shop_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string | null
          id: string
          status: string
          subject: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
          subject: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
          subject?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string | null
          edit_token: string
          email: string | null
          id: string
          kakao_url: string
          manager_name: string
          manager_photo: string | null
          shop_name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          edit_token: string
          email?: string | null
          id?: string
          kakao_url: string
          manager_name: string
          manager_photo?: string | null
          shop_name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          edit_token?: string
          email?: string | null
          id?: string
          kakao_url?: string
          manager_name?: string
          manager_photo?: string | null
          shop_name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Shorthand types
export type Request = Tables<'requests'>
export type Vendor = Tables<'vendors'>
export type Product = Tables<'products'>
export type Ticket = Tables<'tickets'>
export type TicketMessage = Tables<'ticket_messages'>
export type FlyerView = Tables<'flyer_views'>
export type Notification = Tables<'notifications'>
