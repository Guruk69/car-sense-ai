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
      damage_detections: {
        Row: {
          affected_part: string
          bbox_height: number
          bbox_width: number
          bbox_x: number
          bbox_y: number
          confidence: number
          created_at: string
          damage_type: string
          id: string
          report_id: string
          severity: string
        }
        Insert: {
          affected_part: string
          bbox_height: number
          bbox_width: number
          bbox_x: number
          bbox_y: number
          confidence: number
          created_at?: string
          damage_type: string
          id?: string
          report_id: string
          severity: string
        }
        Update: {
          affected_part?: string
          bbox_height?: number
          bbox_width?: number
          bbox_x?: number
          bbox_y?: number
          confidence?: number
          created_at?: string
          damage_type?: string
          id?: string
          report_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_detections_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "damage_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          analysis_status: string
          created_at: string
          id: string
          image_path: string | null
          max_cost: number | null
          min_cost: number | null
          source: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          analysis_status?: string
          created_at?: string
          id?: string
          image_path?: string | null
          max_cost?: number | null
          min_cost?: number | null
          source?: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          analysis_status?: string
          created_at?: string
          id?: string
          image_path?: string | null
          max_cost?: number | null
          min_cost?: number | null
          source?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_events: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          message: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          message?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mechanics: {
        Row: {
          address: string
          created_at: string
          id: string
          is_open: boolean
          latitude: number
          longitude: number
          name: string
          phone: string | null
          rating: number | null
          services: string[]
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          rating?: number | null
          services?: string[]
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          rating?: number | null
          services?: string[]
        }
        Relationships: []
      }
      parking_locations: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      repair_costs: {
        Row: {
          created_at: string
          damage_type: string
          id: string
          max_cost: number
          min_cost: number
          service_type: string
          severity: string
          updated_at: string
          vehicle_part: string
        }
        Insert: {
          created_at?: string
          damage_type: string
          id?: string
          max_cost: number
          min_cost: number
          service_type: string
          severity: string
          updated_at?: string
          vehicle_part: string
        }
        Update: {
          created_at?: string
          damage_type?: string
          id?: string
          max_cost?: number
          min_cost?: number
          service_type?: string
          severity?: string
          updated_at?: string
          vehicle_part?: string
        }
        Relationships: []
      }
      repair_guides: {
        Row: {
          content: string
          created_at: string
          damage_type: string
          id: string
          severity: string
          title: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          damage_type: string
          id?: string
          severity: string
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          damage_type?: string
          id?: string
          severity?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      service_reminders: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string | null
          due_mileage: number | null
          id: string
          service_type: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          service_type: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          service_type?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          current_mileage: number | null
          id: string
          model: string
          nickname: string
          registration_number: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          brand: string
          created_at?: string
          current_mileage?: number | null
          id?: string
          model: string
          nickname: string
          registration_number?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          brand?: string
          created_at?: string
          current_mileage?: number | null
          id?: string
          model?: string
          nickname?: string
          registration_number?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
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
