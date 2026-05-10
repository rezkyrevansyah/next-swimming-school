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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          branch_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          branch_id: string
          class_id: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          recorded_by_coach_id: string | null
          scan_method: Database["public"]["Enums"]["scan_method"]
          scanned_at: string | null
          session_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          class_id: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          recorded_by_coach_id?: string | null
          scan_method?: Database["public"]["Enums"]["scan_method"]
          scanned_at?: string | null
          session_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          class_id?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          recorded_by_coach_id?: string | null
          scan_method?: Database["public"]["Enums"]["scan_method"]
          scanned_at?: string | null
          session_date?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_recorded_by_coach_id_fkey"
            columns: ["recorded_by_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_default: boolean
          location_lat: number | null
          location_lng: number | null
          manager_id: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["branch_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          location_lat?: number | null
          location_lng?: number | null
          manager_id?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["branch_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          location_lat?: number | null
          location_lng?: number | null
          manager_id?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["branch_status"]
          updated_at?: string
        }
        Relationships: []
      }
      class_coaches: {
        Row: {
          assigned_at: string
          class_id: string
          coach_id: string
        }
        Insert: {
          assigned_at?: string
          class_id: string
          coach_id: string
        }
        Update: {
          assigned_at?: string
          class_id?: string
          coach_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_coaches_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          joined_at: string
          member_id: string
          status: string
        }
        Insert: {
          class_id: string
          joined_at?: string
          member_id: string
          status?: string
        }
        Update: {
          class_id?: string
          joined_at?: string
          member_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_id: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          class_id: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          class_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          branch_id: string
          capacity: number
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          monthly_price: number
          name: string
          sessions_per_month: number
          slug: string
          status: Database["public"]["Enums"]["class_status"]
          updated_at: string
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          branch_id: string
          capacity?: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          monthly_price?: number
          name: string
          sessions_per_month?: number
          slug: string
          status?: Database["public"]["Enums"]["class_status"]
          updated_at?: string
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          branch_id?: string
          capacity?: number
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          monthly_price?: number
          name?: string
          sessions_per_month?: number
          slug?: string
          status?: Database["public"]["Enums"]["class_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_branches: {
        Row: {
          assigned_at: string
          branch_id: string
          coach_id: string
          is_primary: boolean
        }
        Insert: {
          assigned_at?: string
          branch_id: string
          coach_id: string
          is_primary?: boolean
        }
        Update: {
          assigned_at?: string
          branch_id?: string
          coach_id?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "coach_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_branches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_certificates: {
        Row: {
          approval_notes: string | null
          approval_status: Database["public"]["Enums"]["certificate_status"]
          approved_at: string | null
          approved_by: string | null
          coach_id: string
          created_at: string
          id: string
          issued_year: number | null
          name: string
          no_expiry: boolean
          photo_url: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: Database["public"]["Enums"]["certificate_status"]
          approved_at?: string | null
          approved_by?: string | null
          coach_id: string
          created_at?: string
          id?: string
          issued_year?: number | null
          name: string
          no_expiry?: boolean
          photo_url?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: Database["public"]["Enums"]["certificate_status"]
          approved_at?: string | null
          approved_by?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          issued_year?: number | null
          name?: string
          no_expiry?: boolean
          photo_url?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_certificates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_clock_records: {
        Row: {
          branch_id: string
          clock_in_accuracy: number | null
          clock_in_at: string
          clock_in_date: string
          clock_in_distance_m: number | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_in_selfie_url: string | null
          coach_id: string
          created_at: string
          id: string
          ip_address: unknown
          notes: string | null
          suspicious_flag: boolean
          user_agent: string | null
        }
        Insert: {
          branch_id: string
          clock_in_accuracy?: number | null
          clock_in_at?: string
          clock_in_date?: string
          clock_in_distance_m?: number | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_in_selfie_url?: string | null
          coach_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          suspicious_flag?: boolean
          user_agent?: string | null
        }
        Update: {
          branch_id?: string
          clock_in_accuracy?: number | null
          clock_in_at?: string
          clock_in_date?: string
          clock_in_distance_m?: number | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_in_selfie_url?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          suspicious_flag?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_clock_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clock_records_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          coach_id: string
          created_at: string
          dob: string | null
          full_name: string
          gender: string | null
          id: string
          nickname: string | null
          phone: string | null
          photo_url: string | null
          specializations: string[] | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          dob?: string | null
          full_name: string
          gender?: string | null
          id?: string
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          dob?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          coach_id_code: string
          created_at: string
          deleted_at: string | null
          id: string
          status: Database["public"]["Enums"]["coach_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_id_code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["coach_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_id_code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["coach_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          address: string | null
          created_at: string
          dob: string
          full_name: string
          gender: string | null
          health_history: string | null
          id: string
          member_id: string
          nickname: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          phone_owner: Database["public"]["Enums"]["phone_owner"]
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          dob: string
          full_name: string
          gender?: string | null
          health_history?: string | null
          id?: string
          member_id: string
          nickname?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          phone_owner?: Database["public"]["Enums"]["phone_owner"]
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          dob?: string
          full_name?: string
          gender?: string | null
          health_history?: string | null
          id?: string
          member_id?: string
          nickname?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          phone_owner?: Database["public"]["Enums"]["phone_owner"]
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_qr_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          member_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          member_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          member_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_qr_tokens_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          branch_id: string
          created_at: string
          deleted_at: string | null
          has_account: boolean
          id: string
          joined_date: string
          member_id_code: string
          payment_handling: Database["public"]["Enums"]["payment_handling"]
          school_id: string | null
          status: Database["public"]["Enums"]["member_status"]
          type: Database["public"]["Enums"]["member_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          deleted_at?: string | null
          has_account?: boolean
          id?: string
          joined_date?: string
          member_id_code: string
          payment_handling?: Database["public"]["Enums"]["payment_handling"]
          school_id?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          type?: Database["public"]["Enums"]["member_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          deleted_at?: string | null
          has_account?: boolean
          id?: string
          joined_date?: string
          member_id_code?: string
          payment_handling?: Database["public"]["Enums"]["payment_handling"]
          school_id?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          type?: Database["public"]["Enums"]["member_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          level: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          branch_id: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          school_user_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          school_user_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          school_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_admin_access_to_branch: {
        Args: { target_branch_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_coach_of_class: { Args: { target_class_id: string }; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      user_branch_id: { Args: never; Returns: string }
      user_coach_id: { Args: never; Returns: string }
      user_member_id: { Args: never; Returns: string }
      user_role: { Args: never; Returns: string }
    }
    Enums: {
      article_status: "draft" | "published" | "archived"
      attendance_status: "present" | "late" | "permitted" | "sick" | "absent"
      branch_status: "active" | "inactive"
      certificate_status: "pending_approval" | "approved" | "rejected"
      class_status: "active" | "inactive"
      coach_status: "pending" | "active" | "inactive"
      invoice_status: "unpaid" | "paid" | "partial"
      member_status: "pending_payment" | "active" | "inactive"
      member_type: "regular" | "affiliate"
      payment_handling: "individual" | "covered_by_school"
      phone_owner: "self" | "parent"
      scan_method: "qr" | "manual"
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
    Enums: {
      article_status: ["draft", "published", "archived"],
      attendance_status: ["present", "late", "permitted", "sick", "absent"],
      branch_status: ["active", "inactive"],
      certificate_status: ["pending_approval", "approved", "rejected"],
      class_status: ["active", "inactive"],
      coach_status: ["pending", "active", "inactive"],
      invoice_status: ["unpaid", "paid", "partial"],
      member_status: ["pending_payment", "active", "inactive"],
      member_type: ["regular", "affiliate"],
      payment_handling: ["individual", "covered_by_school"],
      phone_owner: ["self", "parent"],
      scan_method: ["qr", "manual"],
    },
  },
} as const
