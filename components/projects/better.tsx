import {
  useGetMediaByProjectQuery,
   useGetProjectImagesQuery,
   useGetProjectVideosQuery,
  useGetProjectDocumentsQuery,
  useAddProjectMediaMutation,
  useUpdateProjectMediaMutation,
  useDeleteProjectMediaMutation,
  useToggleFeaturedMutation,
} from "@/redux/features/projects/projectsAPISlice"



import {
  useGetMediaByMilestoneQuery,
   useGetMilestoneImagesQuery,
   useGetMilestoneVideosQuery,
  useGetMilestoneDocumentsQuery,
  useGetDeliverableMediaQuery,
  useAddMilestoneMediaMutation,
  useUpdateMilestoneMediaMutation,
  useDeleteMilestoneMediaMutation,
  useToggleDeliverableMutation,
} from "@/redux/features/projects/milestoneApiSlice"
import type { MilestoneMedia } from "@/types/media"
