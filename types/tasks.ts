export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile_image?: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskType = 'feature' | 'bug' | 'improvement' | 'documentation' | 'research' | 'other'
export interface Task {
  id: number
  title: string
  description?: string
  milestone_id: number
  milestone?: {
    id: number
    title: string
  }
  project_id?: number
  project?: {
    id: number
    title: string
  }
  parent_id?: number
  parent_details?: {
    id: number
    title: string
  }
  status: string
  priority: string
  task_type: string
  start_date?: string
  due_date?: string
  completion_date?: string
  completion_percentage?: number
  estimated_hours?: number
  actual_hours?: number
  assigned_to?: {
    id: number
    first_name: string
    last_name: string
    profile_image?: string
  }[]
  created_by?: {
    id: number
    first_name: string
    last_name: string
  }
  created_at: string
  updated_at: string
  tags?: string
  is_overdue?: boolean
  days_until_due?: number
  subtasks?: Task[]
  comments_count?: number
  attachments_count?: number
  dependencies?: Task[]
  dependents?: Task[]
}

export interface TaskComment {
  id: number
  task: number
  user: User
  content: string
  created_at: string
  updated_at: string
}

export interface TaskAttachment {
  id: number
  task: number
  file: string
  filename: string
  uploaded_by: User
  uploaded_at: string
}

export interface TaskTimeLog {
  id: number
  task: number
  user: User
  minutes: number
  description?: string
  logged_at: string
}

export interface TaskStatistics {
  total: number
  completed: number
  in_progress: number
  todo: number
  blocked: number
  overdue: number
  completion_rate: number
  by_priority: Record<TaskPriority, number>
  by_type: Record<TaskType, number>
  recent_activity: {
    id: number
    title: string
    status: TaskStatus
    updated_at: string
  }[]
}

export interface TaskFilterParams {
  projectId?: number
  milestoneId?: number
  status?: TaskStatus
  priority?: TaskPriority
  taskType?: TaskType
  assignedTo?: number
  createdBy?: number
  dueDateStart?: string
  dueDateEnd?: string
  isOverdue?: boolean
  isCompleted?: boolean
  tags?: string[]
  search?: string
  parent?: number | null
}