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
  tasks?: Task[]
  milestones?: Milestone[]
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
