import type { UserData } from "./project"
import type { Project } from "./project"
import type { Milestone } from "./milestone"

export type TaskStatus = "todo" | "in_progress" | "review" | "completed" | "blocked"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  id: number
  title: string
  description: string
  project: number | Project
  milestone: number | Milestone | null
  parent: number | null
  assigned_to: UserData[]
  created_by: UserData
  status: TaskStatus
  priority: TaskPriority
  start_date: string | null
  due_date: string | null
  completion_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  notes: string | null
  created_at: string
  updated_at: string
  is_completed: boolean
  is_overdue: boolean
  has_subtasks: boolean
  completion_percentage: number
  is_unblocked: boolean
  level: number
  subtasks?: Task[]
  dependencies?: Task[]
  blocked_by?: Task[]
}

export interface CreateTaskRequest {
  title: string
  description: string
  project: number
  milestone?: number | null
  parent?: number | null
  assigned_to_ids?: number[]
  status?: TaskStatus
  priority?: TaskPriority
  start_date?: string | null
  due_date?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  notes?: string | null
  dependency_ids?: number[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  project?: number
  milestone?: number | null
  parent?: number | null
  assigned_to_ids?: number[]
  status?: TaskStatus
  priority?: TaskPriority
  start_date?: string | null
  due_date?: string | null
  completion_date?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  notes?: string | null
  dependency_ids?: number[]
}
