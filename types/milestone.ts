
export interface Milestone {
  id: number
  title: string
  description: string | null
  project: number 
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface CreateMilestoneRequest {
  title: string
  description?: string
  project: number
  due_date?: string | null
}

export interface UpdateMilestoneRequest {
  title?: string
  description?: string
  project?: number
  due_date?: string | null
}
