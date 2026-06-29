export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          identity_statement: string | null;
          chapter: string | null;
          visibility_preference: "private" | "circle" | "public";
          onboarding_completed: boolean;
          timezone: string;
          locale: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
          identity_statement?: string | null;
          chapter?: string | null;
          visibility_preference?: "private" | "circle" | "public";
          onboarding_completed?: boolean;
          timezone?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          identity_statement?: string | null;
          chapter?: string | null;
          visibility_preference?: "private" | "circle" | "public";
          onboarding_completed?: boolean;
          timezone?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      commits: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          type: string | null;
          recorded_at: string;
          duration_minutes: number | null;
          intensity: "light" | "steady" | "deep" | null;
          note: string | null;
          visibility: "private" | "circle" | "public";
          evidence: Json;
          chapter: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          type?: string | null;
          recorded_at?: string;
          duration_minutes?: number | null;
          intensity?: "light" | "steady" | "deep" | null;
          note?: string | null;
          visibility?: "private" | "circle" | "public";
          evidence?: Json;
          chapter?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          type?: string | null;
          recorded_at?: string;
          duration_minutes?: number | null;
          intensity?: "light" | "steady" | "deep" | null;
          note?: string | null;
          visibility?: "private" | "circle" | "public";
          evidence?: Json;
          chapter?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "commits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          commit_id: string;
          content: string;
          type: "technical" | "emotional" | "identity" | "process" | null;
          visibility: "private" | "circle";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          commit_id: string;
          content: string;
          type?: "technical" | "emotional" | "identity" | "process" | null;
          visibility?: "private" | "circle";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          commit_id?: string;
          content?: string;
          type?: "technical" | "emotional" | "identity" | "process" | null;
          visibility?: "private" | "circle";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reflections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reflections_commit_id_fkey";
            columns: ["commit_id"];
            isOneToOne: false;
            referencedRelation: "commits";
            referencedColumns: ["id"];
          },
        ];
      };
      circle_memberships: {
        Row: {
          id: string;
          user_id: string;
          circle_user_id: string;
          status: "pending" | "active" | "paused" | "ended";
          invited_by: string | null;
          joined_at: string;
          ended_at: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          circle_user_id: string;
          status?: "pending" | "active" | "paused" | "ended";
          invited_by?: string | null;
          joined_at?: string;
          ended_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          circle_user_id?: string;
          status?: "pending" | "active" | "paused" | "ended";
          invited_by?: string | null;
          joined_at?: string;
          ended_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "circle_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "circle_memberships_circle_user_id_fkey";
            columns: ["circle_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "circle_memberships_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      supports: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          message: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          message: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          message?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "supports_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supports_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_user_id: string;
          actor_user_id: string | null;
          type:
            | "support_received"
            | "circle_invitation"
            | "invitation_accepted"
            | "reflection_received"
            | "shared_presence";
          entity_type:
            | "support"
            | "circle_membership"
            | "reflection"
            | "commit"
            | null;
          entity_id: string | null;
          message: string;
          read_at: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_user_id: string;
          actor_user_id?: string | null;
          type:
            | "support_received"
            | "circle_invitation"
            | "invitation_accepted"
            | "reflection_received"
            | "shared_presence";
          entity_type?:
            | "support"
            | "circle_membership"
            | "reflection"
            | "commit"
            | null;
          entity_id?: string | null;
          message: string;
          read_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          recipient_user_id?: string;
          actor_user_id?: string | null;
          type?:
            | "support_received"
            | "circle_invitation"
            | "invitation_accepted"
            | "reflection_received"
            | "shared_presence";
          entity_type?:
            | "support"
            | "circle_membership"
            | "reflection"
            | "commit"
            | null;
          entity_id?: string | null;
          message?: string;
          read_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      active_circle_memberships: {
        Row: {
          id: string | null;
          user_id: string | null;
          circle_user_id: string | null;
          joined_at: string | null;
          created_at: string | null;
        };
        Relationships: [];
      };
      visible_commits: {
        Row: {
          id: string | null;
          user_id: string | null;
          profile_name: string | null;
          profile_avatar_url: string | null;
          title: string | null;
          type: string | null;
          recorded_at: string | null;
          duration_minutes: number | null;
          intensity: "light" | "steady" | "deep" | null;
          note: string | null;
          visibility: "private" | "circle" | "public" | null;
          evidence: Json | null;
          created_at: string | null;
        };
        Relationships: [];
      };
      commit_reflection_counts: {
        Row: {
          commit_id: string | null;
          reflection_count: number | null;
        };
        Relationships: [];
      };
      support_history: {
        Row: {
          id: string | null;
          from_user_id: string | null;
          from_name: string | null;
          from_avatar_url: string | null;
          to_user_id: string | null;
          to_name: string | null;
          to_avatar_url: string | null;
          message: string | null;
          created_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_circle_presence: {
        Args: {
          p_profile_id?: string;
          p_since?: string;
        };
        Returns: {
          member_id: string;
          member_name: string;
          member_avatar_url: string | null;
          last_commit_id: string | null;
          last_commit_title: string | null;
          last_commit_recorded_at: string | null;
          active_commit_count: number;
        }[];
      };
      get_journey_timeline: {
        Args: {
          p_profile_id?: string;
          p_limit?: number;
          p_before?: string | null;
        };
        Returns: {
          commit_id: string;
          user_id: string;
          title: string | null;
          type: string | null;
          recorded_at: string;
          duration_minutes: number | null;
          intensity: "light" | "steady" | "deep" | null;
          note: string | null;
          visibility: "private" | "circle" | "public";
          evidence: Json;
          reflections: Json;
        }[];
      };
      get_shared_history: {
        Args: {
          p_other_profile_id: string;
          p_limit?: number;
        };
        Returns: {
          other_profile_id: string;
          joined_at: string;
          days_connected: number;
          shared_commit_count: number;
          supports_sent: number;
          supports_received: number;
          recent_commits: Json;
          recent_supports: Json;
        }[];
      };
      get_progress_summary: {
        Args: {
          p_profile_id?: string;
          p_from?: string;
          p_to?: string;
        };
        Returns: {
          profile_id: string;
          total_commits: number;
          active_days: number;
          first_commit_at: string | null;
          last_commit_at: string | null;
        }[];
      };
      get_commit_detail: {
        Args: {
          p_commit_id: string;
        };
        Returns: {
          commit_id: string;
          user_id: string;
          profile: Json;
          title: string | null;
          type: string | null;
          recorded_at: string;
          duration_minutes: number | null;
          intensity: "light" | "steady" | "deep" | null;
          note: string | null;
          visibility: "private" | "circle" | "public";
          evidence: Json;
          created_at: string;
          reflections: Json;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Update"];

export type Views<ViewName extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][ViewName]["Row"];

export type Functions<FunctionName extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][FunctionName];
