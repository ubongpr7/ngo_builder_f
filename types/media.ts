
export interface BaseMedia {
  id: number
  media_type: "image" | "video" | "document" | "audio" | "blueprint" | "contract" | "diagram" | "report"
  file: string
  file_url: string
  title: string
  description: string | null
  caption: string | null
  uploaded_by: number
  uploaded_by_details?: {
    id: number
    username: string
    first_name: string
    last_name: string
    profile_image?: string
  }
  uploaded_at: string
  updated_at: string
  is_featured:boolean
  represents_deliverable:boolean
}

export interface ProjectMedia extends BaseMedia {
  project: number
  is_featured: boolean
}

export interface MilestoneMedia extends BaseMedia {
  milestone: number
  represents_deliverable: boolean
}

// You already have ProjectMedia defined for updates, so you might want to rename it
// to avoid conflicts, for example:
export interface ProjectUpdateMedia extends BaseMedia {
  update: number
}
