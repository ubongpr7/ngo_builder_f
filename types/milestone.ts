
export interface Milestone {
  id: number
  title: string
  description: string | null
  project: {
    id:number
    title: string
    description: string
    budget: number
    status: string
  } 
  piority: string
  due_date: string | null
  created_at: string
  updated_at: string
  project_details: {
    id: number
    title: string
    description: string
    budget: number
    status: string
  }
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
