import  type { Task } from "./tasks"
import type { Milestone } from "./milestone"
import { Currency } from "./finance";


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
  featured_image?: string | ''
  team_member_count?:number|0
  description: string | null
  start_date: string | ''
  completion_percentage?: number
  end_date: string | ''
  created_by: UserData
  created_at: string
  days_remaining: number
  currency:Currency
  updated_at: string
  budget_utilization?: number
  team_member_details?: ProjectUser[]
  target_end_date: string
  actual_end_date?: string
  notes?: string
  location?: string
  category_details?: {
    id: number
    name: string
    description?: string
  }
  category: string
  project_type: string
  funds_allocated?: number
  funds_spent: number
  budget: number
  risks?: string
  beneficiaries?: string
  deliverables?: string
  success_criteria?: string
  team_members?: ProjectUser[]
  officials_details?: ProjectUser[]
  manager_details?: ProjectUser
  created_by_details?: ProjectUser
  manager?: ProjectUser
  tasks?: Task[]
  milestones?: Milestone[]
  status: "planned" | "in_progress" | "active" | "completed" |"planning" | "on_hold" | "cancelled"| "waiting_for_approval"| "submitted"
  is_overbudget?: boolean
  milestones_count?: number
  task_count?: number
  milestones_completed_count?: number
  task_completed_count?: number
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
  project_details?: {
    id: number
    title: string
  }
  summary: string
  next_steps: string
  achievements: string
  challenges:string
  date: string
  funds_spent_today:number  
  submitted_by_details?: ProjectUser
  attachments?: {
    id: number
    name: string
    file: string
    file_type: string
  }[]
  comments_count?: number
  created_at: string
  updated_at: string
  media_files:Array<{
    media_type:string
    file:string
    file_url:string
    caption:string
    uploaded_at:string
    
  }>
  project_id:string
}


export interface ProjectCategory {
  id: number;
  name: string;
  description?: string;
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
  
  updates_this_week: number;
  updates_this_month: number;
  updates_this_year: number;
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




export interface ProjectTeamMember {
  id: number
  project: number
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  role: string
  responsibilities?: string
  join_date: string
  end_date?: string
}


export interface MilestoneStatistics {
  total_milestones: number
  status_counts: Array<{
    status: string
    count: number
  }>
  priority_counts: Array<{
    priority: string
    count: number
  }>
  avg_completion: {
    avg_completion: number
  }
  overdue_count: number
  upcoming_count: number
  assignee_counts: Array<{
    assigned_to__id: number
    assigned_to__username: string
    assigned_to__first_name: string
    assigned_to__last_name: string
    count: number
  }>
}


export interface ExpenseStatistics {
  total_expenses: {
    total: number
    pending: number
    approved: number
    rejected: number
    reimbursed: number
  }
  status_counts: Array<{
    status: string
    count: number
    total: number
  }>
  category_counts: Array<{
    category: string
    count: number
    total: number
  }>
  expenses_by_month: Array<{
    month: string
    count: number
    total: number
  }>
  expenses_by_user: Array<{
    incurred_by__id: number
    incurred_by__username: string
    incurred_by__first_name: string
    incurred_by__last_name: string
    count: number
    total: number
  }>
}

export interface ProjectUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  profile_image?: string
}

export interface ProjectAsset {
  id: number
  project: number
  asset: {
    id: number
    name: string
    asset_type: string
    model?: string
    serial_number?: string
  }
  assigned_date: string
  assigned_by: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  return_date?: string
  notes?: string
}

export interface ProjectComment {
  id: number
  project: number
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  content: string
  created_at: string
  updated_at: string
  parent?: ProjectComment | null
}


export interface ProjectMilestone {
  id: number
  project: {
    id: number
    title: string
    description: string
  }
  tasks_count:number
  completed_tasks_count:number
  external_links:string
  start_date: string
  title: string
  description: string
  project_details?: {
    id: number
    title: string
    description: string
    budget: number
  }
  due_date: string
  completion_date?: string
  status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  completion_percentage: number
  assigned_to?: Array<{
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    profile_image?: string
    role: string

  }>
  documents?: Array<{
    id: number
    name: string
    file: string
    file_type: string
    uploaded_by:string
    upload_date:string

  }>
  dependencies?: Array<{
    id: number
    title: string
    status: string
    due_date: string
  }>
  comments: Array<{
    id: number
    content: string
    created_at: string
    updated_at: string
    user: {
      id: number
      username: string
      first_name: string
      last_name: string
      email: string
      profile_image?: string
    
    }
  }>

  deliverables?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  created_by_details?: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  days_remaining: number
  is_overdue: boolean
}

export interface ProjectExpense {
  id: number
  project: number
  title: string
  description: string
  category: string
  amount: number
  date_incurred: string
  incurred_by_details:ProjectUser
  approved_by_details?: ProjectUser
  receipt?: string
  status: string
  approval_date?: string
  
  notes?: string
}
