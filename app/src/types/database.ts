// Database types for Supabase
// This file will be auto-generated later using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export interface Database {
  public: {
    Tables: {
      // Existing tables (keeping for backward compatibility)
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // New domain model tables
      emne: {
        Row: {
          id: string
          title: string
          code: string | null // e.g., "MAT121"
          description: string | null
          semester: string | null
          created_by: string
          goals: string | null
          syllabus_url: string | null
          meeting_schedule: string | null
          ai_settings: string | null // JSON for AI workflow settings
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          code?: string | null
          description?: string | null
          semester?: string | null
          created_by: string
          goals?: string | null
          syllabus_url?: string | null
          meeting_schedule?: string | null
          ai_settings?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          code?: string | null
          description?: string | null
          semester?: string | null
          created_by?: string
          goals?: string | null
          syllabus_url?: string | null
          meeting_schedule?: string | null
          ai_settings?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      emne_members: {
        Row: {
          id: string
          emne_id: string
          user_id: string
          role: 'admin' | 'member' | 'leader'
          preferences: string | null // JSON for user preferences
          joined_at: string
          last_active: string | null
        }
        Insert: {
          id?: string
          emne_id: string
          user_id: string
          role?: 'admin' | 'member' | 'leader'
          preferences?: string | null
          joined_at?: string
          last_active?: string | null
        }
        Update: {
          id?: string
          emne_id?: string
          user_id?: string
          role?: 'admin' | 'member' | 'leader'
          preferences?: string | null
          joined_at?: string
          last_active?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          emne_id: string
          title: string
          scheduled_at: string
          duration_minutes: number | null
          agenda: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          meeting_leader: string | null // user_id of rotating leader
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emne_id: string
          title: string
          scheduled_at: string
          duration_minutes?: number | null
          agenda?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          meeting_leader?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emne_id?: string
          title?: string
          scheduled_at?: string
          duration_minutes?: number | null
          agenda?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          meeting_leader?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agenda_items: {
        Row: {
          id: string
          meeting_id: string
          title: string
          description: string | null
          order_index: number
          estimated_minutes: number | null
          status: 'pending' | 'in_progress' | 'completed' | 'skipped'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          title: string
          description?: string | null
          order_index: number
          estimated_minutes?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          title?: string
          description?: string | null
          order_index?: number
          estimated_minutes?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          emne_id: string
          meeting_id: string | null
          user_id: string | null // null for shared tasks
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emne_id: string
          meeting_id?: string | null
          user_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emne_id?: string
          meeting_id?: string | null
          user_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          emne_id: string
          meeting_id: string | null
          user_id: string
          title: string
          content: string
          type: 'note' | 'question' | 'insight' | 'summary'
          tags: string | null // JSON array of tags
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emne_id: string
          meeting_id?: string | null
          user_id: string
          title: string
          content: string
          type?: 'note' | 'question' | 'insight' | 'summary'
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emne_id?: string
          meeting_id?: string | null
          user_id?: string
          title?: string
          content?: string
          type?: 'note' | 'question' | 'insight' | 'summary'
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      master_documents: {
        Row: {
          id: string
          emne_id: string
          title: string
          content: string
          version: number
          generated_at: string
          ai_prompt: string | null
          source_contributions: string | null // JSON array of contribution IDs
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emne_id: string
          title: string
          content: string
          version?: number
          generated_at?: string
          ai_prompt?: string | null
          source_contributions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emne_id?: string
          title?: string
          content?: string
          version?: number
          generated_at?: string
          ai_prompt?: string | null
          source_contributions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_goals: {
        Row: {
          id: string
          emne_id: string
          title: string
          description: string | null
          target_date: string | null
          status: 'active' | 'completed' | 'cancelled'
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emne_id: string
          title: string
          description?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emne_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Helper types for easier usage
export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']

export type Todo = Database['public']['Tables']['todos']['Row']
export type TodoInsert = Database['public']['Tables']['todos']['Insert']
export type TodoUpdate = Database['public']['Tables']['todos']['Update']

// New domain model types
export type Emne = Database['public']['Tables']['emne']['Row']
export type EmneInsert = Database['public']['Tables']['emne']['Insert']
export type EmneUpdate = Database['public']['Tables']['emne']['Update']

export type EmneMember = Database['public']['Tables']['emne_members']['Row']
export type EmneMemberInsert = Database['public']['Tables']['emne_members']['Insert']
export type EmneMemberUpdate = Database['public']['Tables']['emne_members']['Update']

export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export type AgendaItem = Database['public']['Tables']['agenda_items']['Row']
export type AgendaItemInsert = Database['public']['Tables']['agenda_items']['Insert']
export type AgendaItemUpdate = Database['public']['Tables']['agenda_items']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Contribution = Database['public']['Tables']['contributions']['Row']
export type ContributionInsert = Database['public']['Tables']['contributions']['Insert']
export type ContributionUpdate = Database['public']['Tables']['contributions']['Update']

export type MasterDocument = Database['public']['Tables']['master_documents']['Row']
export type MasterDocumentInsert = Database['public']['Tables']['master_documents']['Insert']
export type MasterDocumentUpdate = Database['public']['Tables']['master_documents']['Update']

export type ProgressGoal = Database['public']['Tables']['progress_goals']['Row']
export type ProgressGoalInsert = Database['public']['Tables']['progress_goals']['Insert']
export type ProgressGoalUpdate = Database['public']['Tables']['progress_goals']['Update']

// Extended types with joins
export type EmneMemberWithUser = EmneMember & {
  user: {
    id: string
    email: string
  } | null
}
