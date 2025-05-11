import  type { Task } from "./tasks"
import type { Milestone } from "./milestone"


export interface UserData {
    id: number;
    email: string;
    phone?: string | null;
    picture?: string | null;
    first_name: string;
    last_name: string;
    sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    is_verified: boolean;
    is_staff: boolean;
    is_subscriber: boolean;
    is_worker: boolean;
    is_main: boolean;
    date_of_birth?: Date | string | null;
    profile?: number | null;
    date_joined: Date | string;
    last_login?: Date | string | null;
    password:string;
  }
  

export interface Project {
  id: number
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  created_by: UserData
  created_at: string
  updated_at: string
  budget_utilization?: number
  target_end_date?: string
  tasks?: Task[]
  milestones?: Milestone[]
  status: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled"
}

export interface CreateProjectRequest {
  title: string
  description?: string
  start_date?: string | null
  end_date?: string | null
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  start_date?: string | null
  end_date?: string | null
}



export interface UpdateProjectRequest {
  title?: string
  description?: string
  status?: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled"
  start_date?: string | null
  due_date?: string
  completion_date?: string
  manager?: number
  team_members?: number[]
  budget?: number
}

export interface ProjectUpdate {
  id: number
  project: number | Project
  title: string
  content: string
  type: "milestone" | "progress" | "general"
  author: {
    id: number
    name: string
    profile_image?: string
  }
  attachments?: {
    id: number
    name: string
    file: string
    file_type: string
  }[]
  comments_count?: number
  created_at: string
  updated_at: string
}


export interface ProjectCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ProjectMedia {
  id: number;
  update: number;
  media_type: 'image' | 'video' | 'document' | 'audio';
  file: string;
  file_url: string;
  caption?: string;
  uploaded_at: string;
}

export interface ProjectStatistics {
  status_counts: Record<string, number>;
  type_counts: Record<string, number>;
  budget_stats: {
    total_budget: number;
    total_allocated: number;
    total_spent: number;
    avg_budget: number;
  };
  timeline_stats: {
    active_projects: number;
    delayed_projects: number;
    completed_on_time: number;
    completed_late: number;
  };
  category_counts: Record<string, number>;
}

export interface UpdateStatistics {
  total_updates: number;
  updates_by_project: Array<{
    project__title: string;
    count: number;
  }>;
  total_funds_spent: number;
  updates_by_user: Array<{
    submitted_by__username: string;
    submitted_by__first_name: string;
    submitted_by__last_name: string;
    count: number;
  }>;
  updates_by_date: Array<{
    date: string;
    count: number;
  }>;
}
