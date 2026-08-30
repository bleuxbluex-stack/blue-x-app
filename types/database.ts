export type UserRole = 'client' | 'provider' | 'operations';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          preferred_lang: string | null;
          home_address: string | null;
          apartment_no: string | null;
          postal_code: string | null;
          city: string | null;
          canton: string | null;
          country: string | null;
          customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          preferred_lang?: string | null;
          home_address?: string | null;
          apartment_no?: string | null;
          postal_code?: string | null;
          city?: string | null;
          canton?: string | null;
          country?: string | null;
          customer_id?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          preferred_lang?: string | null;
          home_address?: string | null;
          apartment_no?: string | null;
          postal_code?: string | null;
          city?: string | null;
          canton?: string | null;
          country?: string | null;
          customer_id?: string | null;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          id: string;
          user_id: string;
          preferences: string | null;
          saved_providers: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferences?: string | null;
          saved_providers?: string[] | null;
        };
        Update: {
          preferences?: string | null;
          saved_providers?: string[] | null;
        };
        Relationships: [];
      };
      provider_profiles: {
        Row: {
          user_id: string;
          skills: string[];
          experience_years: number;
          hourly_rate: number | null;
          bio: string | null;
          languages: string[];
          verification_status: string | null;
          id_document_url: string | null;
          selfie_url: string | null;
          address_proof_url: string | null;
          certificates: string[];
          is_verified: boolean | null;
          created_at: string;
          updated_at: string;
          provider_type: string | null;
          company_name: string | null;
          vat_number: string | null;
          business_registration_url: string | null;
          liability_insurance_url: string | null;
          business_registration_number: string | null;
          legal_representative: string | null;
          website: string | null;
          country: string | null;
          vat_certificate_url: string | null;
          company_logo_url: string | null;
          business_license_url: string | null;
        };
        Insert: {
          user_id: string;
          skills?: string[];
          experience_years?: number;
          hourly_rate?: number | null;
          bio?: string | null;
          languages?: string[];
          verification_status?: string | null;
          id_document_url?: string | null;
          selfie_url?: string | null;
          address_proof_url?: string | null;
          certificates?: string[];
          is_verified?: boolean | null;
          provider_type?: string | null;
          company_name?: string | null;
          vat_number?: string | null;
          business_registration_url?: string | null;
          liability_insurance_url?: string | null;
          business_registration_number?: string | null;
          legal_representative?: string | null;
          website?: string | null;
          country?: string | null;
          vat_certificate_url?: string | null;
          company_logo_url?: string | null;
          business_license_url?: string | null;
        };
        Update: {
          skills?: string[];
          experience_years?: number;
          hourly_rate?: number | null;
          bio?: string | null;
          languages?: string[];
          verification_status?: string | null;
          id_document_url?: string | null;
          selfie_url?: string | null;
          address_proof_url?: string | null;
          certificates?: string[];
          is_verified?: boolean | null;
          provider_type?: string | null;
          company_name?: string | null;
          vat_number?: string | null;
          business_registration_url?: string | null;
          liability_insurance_url?: string | null;
          business_registration_number?: string | null;
          legal_representative?: string | null;
          website?: string | null;
          country?: string | null;
          vat_certificate_url?: string | null;
          company_logo_url?: string | null;
          business_license_url?: string | null;
        };
        Relationships: [];
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          icon: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          icon?: string | null;
          description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string | null;
          icon?: string | null;
          description?: string | null;
        };
        Relationships: [];
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          price_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          price_type?: string | null;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          price_type?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          provider_id: string;
          provider_service_id: string | null;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at: string;
          duration_hours: number;
          total_price: number;
          notes: string | null;
          quick_booking_enabled: boolean;
          assigned_employee_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          provider_id: string;
          provider_service_id?: string | null;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at: string;
          duration_hours: number;
          total_price: number;
          notes?: string | null;
          quick_booking_enabled?: boolean;
          assigned_employee_id?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at?: string;
          notes?: string | null;
          total_price?: number;
          quick_booking_enabled?: boolean;
          assigned_employee_id?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          booking_id: string | null;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          booking_id?: string | null;
          content: string;
          is_read?: boolean;
        };
        Update: {
          content?: string;
          is_read?: boolean;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
      ocr_documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          file_url: string;
          status: string | null;
          confidence: number | null;
          extracted_data: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          file_url: string;
          status?: string | null;
          confidence?: number | null;
          extracted_data?: Record<string, any> | null;
        };
        Update: {
          status?: string | null;
          confidence?: number | null;
          extracted_data?: Record<string, any> | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          verified: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          verified?: boolean | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string | null;
        };
        Update: {
          role?: string | null;
        };
        Relationships: [];
      };
      public_tenders: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          budget: number | null;
          deadline: string;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          budget?: number | null;
          deadline: string;
          status?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          budget?: number | null;
          deadline?: string;
          status?: string | null;
        };
        Relationships: [];
      };
      tender_bids: {
        Row: {
          id: string;
          tender_id: string;
          provider_id: string;
          amount: number;
          proposal: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tender_id: string;
          provider_id: string;
          amount: number;
          proposal?: string | null;
          status?: string | null;
        };
        Update: {
          amount?: number;
          proposal?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [key: string]: any };
    Functions: { [key: string]: any };
    Enums: { [key: string]: any };
    CompositeTypes: { [key: string]: any };
  };
}

type TableName = keyof Database['public']['Tables'];
export type Tables<T extends TableName> = Database['public']['Tables'][T]['Row'];
