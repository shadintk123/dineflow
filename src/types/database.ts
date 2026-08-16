export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: 'customer' | 'owner' | 'admin';
          avatar: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          role?: 'customer' | 'owner' | 'admin';
          avatar?: string;
        };
        Update: {
          email?: string;
          name?: string;
          phone?: string;
          role?: 'customer' | 'owner' | 'admin';
          avatar?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          cuisine: string[];
          phone: string;
          email: string;
          address: string;
          city: string;
          district: string;
          state: string;
          postal_code: string;
          landmark: string;
          lat: number;
          lng: number;
          opening_hours: string;
          closing_hours: string;
          working_days: string[];
          seating_capacity: number;
          price_range: number;
          rating: number;
          review_count: number;
          logo: string;
          cover: string;
          photos: string[];
          amenities: string[];
          status: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
          online_capacity: number;
          walk_in_capacity: number;
          flexible_capacity: number;
          grace_period: number;
          deposit_enabled: boolean;
          deposit_amount: number;
          max_prep_load: number;
          cancellation_policy: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string;
          cuisine?: string[];
          phone?: string;
          email?: string;
          address?: string;
          city?: string;
          district?: string;
          state?: string;
          postal_code?: string;
          landmark?: string;
          lat?: number;
          lng?: number;
          opening_hours?: string;
          closing_hours?: string;
          working_days?: string[];
          seating_capacity?: number;
          price_range?: number;
          rating?: number;
          review_count?: number;
          logo?: string;
          cover?: string;
          photos?: string[];
          amenities?: string[];
          status?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
          online_capacity?: number;
          walk_in_capacity?: number;
          flexible_capacity?: number;
          grace_period?: number;
          deposit_enabled?: boolean;
          deposit_amount?: number;
          max_prep_load?: number;
          cancellation_policy?: Record<string, unknown>;
        };
        Update: {
          name?: string;
          description?: string;
          cuisine?: string[];
          phone?: string;
          email?: string;
          address?: string;
          city?: string;
          district?: string;
          state?: string;
          postal_code?: string;
          landmark?: string;
          lat?: number;
          lng?: number;
          opening_hours?: string;
          closing_hours?: string;
          working_days?: string[];
          seating_capacity?: number;
          price_range?: number;
          logo?: string;
          cover?: string;
          photos?: string[];
          amenities?: string[];
          status?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
          online_capacity?: number;
          walk_in_capacity?: number;
          flexible_capacity?: number;
          grace_period?: number;
          deposit_enabled?: boolean;
          deposit_amount?: number;
          max_prep_load?: number;
          cancellation_policy?: Record<string, unknown>;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          sort_order?: number;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          name: string;
          description: string;
          price: number;
          discount_price: number | null;
          image: string;
          is_veg: boolean;
          available: boolean;
          prep_time: number;
          prep_category: 'quick' | 'standard' | 'long' | 'after_arrival';
          spice_level: string;
          allergens: string[];
          tags: string[];
          popular: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id?: string | null;
          name: string;
          description?: string;
          price?: number;
          discount_price?: number | null;
          image?: string;
          is_veg?: boolean;
          available?: boolean;
          prep_time?: number;
          prep_category?: 'quick' | 'standard' | 'long' | 'after_arrival';
          spice_level?: string;
          allergens?: string[];
          tags?: string[];
          popular?: boolean;
          sort_order?: number;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string;
          price?: number;
          discount_price?: number | null;
          image?: string;
          is_veg?: boolean;
          available?: boolean;
          prep_time?: number;
          prep_category?: 'quick' | 'standard' | 'long' | 'after_arrival';
          spice_level?: string;
          allergens?: string[];
          tags?: string[];
          popular?: boolean;
          sort_order?: number;
        };
      };
      restaurant_tables: {
        Row: {
          id: string;
          restaurant_id: string;
          code: string;
          capacity: number;
          area: 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';
          status: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'unavailable';
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          code: string;
          capacity?: number;
          area?: 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';
          status?: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'unavailable';
        };
        Update: {
          code?: string;
          capacity?: number;
          area?: 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';
          status?: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'unavailable';
        };
      };
      reservations: {
        Row: {
          id: string;
          reservation_code: string;
          restaurant_id: string;
          customer_id: string;
          table_id: string | null;
          date: string;
          time: string;
          guests: number;
          duration: number;
          seating_area: 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';
          status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
          arrival_status: 'on_time' | 'en_route' | 'running_late' | 'arrived';
          arrival_time: string;
          expected_arrival: string;
          prep_start_time: string;
          prep_status: 'new' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          qr_code: string;
          deposit: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_code?: string;
          restaurant_id: string;
          customer_id: string;
          table_id?: string | null;
          date: string;
          time: string;
          guests: number;
          duration?: number;
          seating_area?: 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';
          status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
          arrival_status?: 'on_time' | 'en_route' | 'running_late' | 'arrived';
          arrival_time?: string;
          expected_arrival?: string;
          prep_start_time?: string;
          prep_status?: 'new' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          qr_code?: string;
          deposit?: number;
          notes?: string;
        };
        Update: {
          table_id?: string | null;
          status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
          arrival_status?: 'on_time' | 'en_route' | 'running_late' | 'arrived';
          arrival_time?: string;
          expected_arrival?: string;
          prep_start_time?: string;
          prep_status?: 'new' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          notes?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          restaurant_id: string;
          customer_id: string;
          reservation_id: string | null;
          total: number;
          status: 'pending_payment' | 'payment_failed' | 'confirmed' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          prep_option: 'confirm_later' | 'prepare_on_arrival';
          scheduled_prep_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_code?: string;
          restaurant_id: string;
          customer_id: string;
          reservation_id?: string | null;
          total?: number;
          status?: 'pending_payment' | 'payment_failed' | 'confirmed' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          prep_option?: 'confirm_later' | 'prepare_on_arrival';
          scheduled_prep_time?: string;
        };
        Update: {
          status?: 'pending_payment' | 'payment_failed' | 'confirmed' | 'scheduled' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          prep_option?: 'confirm_later' | 'prepare_on_arrival';
          scheduled_prep_time?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          price: number;
          image: string;
          quantity: number;
          instructions: string;
          prep_time: number;
          prep_category: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          price: number;
          image?: string;
          quantity?: number;
          instructions?: string;
          prep_time?: number;
          prep_category?: string;
        };
        Update: {
          quantity?: number;
          instructions?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          payment_code: string;
          order_id: string | null;
          reservation_id: string | null;
          customer_id: string;
          restaurant_id: string;
          amount: number;
          status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          type: 'order' | 'deposit';
          gateway: string;
          gateway_payment_id: string;
          refund_amount: number;
          refund_reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_code?: string;
          order_id?: string | null;
          reservation_id?: string | null;
          customer_id: string;
          restaurant_id: string;
          amount?: number;
          status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          type?: 'order' | 'deposit';
          gateway?: string;
          gateway_payment_id?: string;
          refund_amount?: number;
          refund_reason?: string;
        };
        Update: {
          status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded' | 'partially_refunded';
          gateway_payment_id?: string;
          refund_amount?: number;
          refund_reason?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          customer_id: string;
          customer_name: string;
          rating: number;
          comment: string;
          owner_reply: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_id: string;
          customer_name: string;
          rating: number;
          comment?: string;
          owner_reply?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          owner_reply?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'success' | 'info' | 'warning' | 'error';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message?: string;
          type?: 'success' | 'info' | 'warning' | 'error';
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
      restaurant_applications: {
        Row: {
          id: string;
          owner_id: string;
          owner_name: string;
          owner_email: string;
          owner_phone: string;
          restaurant_name: string;
          description: string;
          cuisine: string[];
          restaurant_phone: string;
          restaurant_email: string;
          address: string;
          city: string;
          district: string;
          state: string;
          postal_code: string;
          landmark: string;
          opening_hours: string;
          closing_hours: string;
          seating_capacity: number;
          tables_count: number;
          price_range: number;
          amenities: string[];
          status: 'pending' | 'approved' | 'rejected';
          admin_notes: string;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          owner_name: string;
          owner_email: string;
          owner_phone?: string;
          restaurant_name: string;
          description?: string;
          cuisine?: string[];
          restaurant_phone?: string;
          restaurant_email?: string;
          address?: string;
          city?: string;
          district?: string;
          state?: string;
          postal_code?: string;
          landmark?: string;
          opening_hours?: string;
          closing_hours?: string;
          seating_capacity?: number;
          tables_count?: number;
          price_range?: number;
          amenities?: string[];
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string;
          reviewed_at?: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          type: 'fake_restaurant' | 'incorrect_info' | 'reservation' | 'payment' | 'service';
          reporter_id: string | null;
          reporter_name: string;
          restaurant_id: string;
          description: string;
          status: 'open' | 'investigating' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'fake_restaurant' | 'incorrect_info' | 'reservation' | 'payment' | 'service';
          reporter_id?: string | null;
          reporter_name: string;
          restaurant_id: string;
          description: string;
          status?: 'open' | 'investigating' | 'resolved' | 'dismissed';
        };
        Update: {
          status?: 'open' | 'investigating' | 'resolved' | 'dismissed';
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          role: string;
          action: string;
          resource: string;
          resource_id: string;
          details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          role?: string;
          action: string;
          resource?: string;
          resource_id?: string;
          details?: Record<string, unknown>;
        };
        Update: {};
      };
    };
  };
};
