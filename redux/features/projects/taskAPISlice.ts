import { apiSlice } from "../../services/apiSlice"
import type { Task, TaskComment, TaskAttachment, TaskTimeLog, TaskStatistics } from "@/types/tasks"

const task_api = "task_api"

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Basic CRUD operations
    getAllTasks: builder.query<Task[], void>({
      query: () => `/${task_api}/tasks/`,
    }),

    getTaskById: builder.query<Task, number>({
      query: (id) => `/${task_api}/tasks/${id}/`,
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      query: (data) => ({
        url: `/${task_api}/tasks/`,
        method: "POST",
        body: data,
      }),
    }),

    updateTask: builder.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/${task_api}/tasks/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${task_api}/tasks/${id}/`,
        method: "DELETE",
      }),
    }),

    // Filtered queries
    getTasksByProject: builder.query<Task[], number>({
      query: (projectId) => `/${task_api}/tasks/by_project/?project_id=${projectId}`,
    }),

    getTasksByMilestone: builder.query<Task[], number>({
      query: (milestoneId) => `/${task_api}/tasks/by_milestone/?milestone_id=${milestoneId}`,
    }),

    getTasksByUser: builder.query<Task[], number | void>({
      query: (userId) =>
        userId ? `/${task_api}/tasks/by_user/?user_id=${userId}` : `/${task_api}/tasks/by_user/`,
    }),

    getSubtasks: builder.query<Task[], number>({
      query: (parentId) => `/${task_api}/tasks/?parent_id=${parentId}`,
    }),

    getTopLevelTasks: builder.query<Task[], number | void>({
      query: (projectId) => {
        let url = `/${task_api}/tasks/?parent_id=null`
        if (projectId) {
          url += `&project_id=${projectId}`
        }
        return url
      },
    }),

    getUpcomingTasks: builder.query<Task[], { projectId?: number; userId?: number; days?: number }>({
      query: (params) => {
        let url = `/${task_api}/tasks/upcoming/`
        const queryParams = []

        if (params?.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params?.userId) {
          queryParams.push(`user_id=${params.userId}`)
        }

        if (params?.days) {
          queryParams.push(`days=${params.days}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    getOverdueTasks: builder.query<Task[], { projectId?: number; userId?: number }>({
      query: (params) => {
        let url = `/${task_api}/tasks/overdue/`
        const queryParams = []

        if (params?.projectId) {
          queryParams.push(`project_id=${params.projectId}`)
        }

        if (params?.userId) {
          queryParams.push(`user_id=${params.userId}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Advanced filtering
    getFilteredTasks: builder.query<
      Task[],
      {
        projectId?: number
        milestoneId?: number
        status?: string
        priority?: string
        taskType?: string
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
    >({
      query: (params) => {
        let url = `/${task_api}/tasks/`
        const queryParams = []

        if (params.projectId) {
          queryParams.push(`project=${params.projectId}`)
        }

        if (params.milestoneId) {
          queryParams.push(`milestone=${params.milestoneId}`)
        }

        if (params.status) {
          queryParams.push(`status=${params.status}`)
        }

        if (params.priority) {
          queryParams.push(`priority=${params.priority}`)
        }

        if (params.taskType) {
          queryParams.push(`task_type=${params.taskType}`)
        }

        if (params.assignedTo) {
          queryParams.push(`assigned_to=${params.assignedTo}`)
        }

        if (params.createdBy) {
          queryParams.push(`created_by=${params.createdBy}`)
        }

        if (params.dueDateStart) {
          queryParams.push(`due_date_start=${params.dueDateStart}`)
        }

        if (params.dueDateEnd) {
          queryParams.push(`due_date_end=${params.dueDateEnd}`)
        }

        if (params.isOverdue !== undefined) {
          queryParams.push(`is_overdue=${params.isOverdue}`)
        }

        if (params.isCompleted !== undefined) {
          queryParams.push(`is_completed=${params.isCompleted}`)
        }

        if (params.tags && params.tags.length > 0) {
          queryParams.push(`tags=${params.tags.join(",")}`)
        }

        if (params.search) {
          queryParams.push(`search=${params.search}`)
        }

        if (params.parent !== undefined) {
          queryParams.push(`parent_id=${params.parent === null ? 'null' : params.parent}`)
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`
        }

        return url
      },
    }),

    // Task tree (hierarchical view)
    getTaskTree: builder.query<Task[], number | void>({
      query: (projectId) => {
        let url = `/${task_api}/tasks/tree/`
        if (projectId) {
          url += `?project_id=${projectId}`
        }
        return url
      },
    }),

    // Custom actions
    completeTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${task_api}/tasks/${id}/complete/`,
        method: "POST",
      }),
    }),

    updateTaskStatus: builder.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/${task_api}/tasks/${id}/update_status/`,
        method: "POST",
        body: { status },
      }),
    }),

    updateTaskPercentage: builder.mutation<void, { id: number; completionPercentage: number }>({
      query: ({ id, completionPercentage }) => ({
        url: `/${task_api}/tasks/${id}/update_percentage/`,
        method: "POST",
        body: { completion_percentage: completionPercentage },
      }),
    }),

    assignUsersToTask: builder.mutation<void, { id: number; userIds: number[] }>({
      query: ({ id, userIds }) => ({
        url: `/${task_api}/tasks/${id}/assign_users/`,
        method: "POST",
        body: { user_ids: userIds },
      }),
    }),

    addTimeToTask: builder.mutation<TaskTimeLog, { id: number; minutes: number; description?: string }>({
      query: ({ id, minutes, description }) => ({
        url: `/${task_api}/tasks/${id}/add_time/`,
        method: "POST",
        body: { minutes, description },
      }),
    }),

    createSubtask: builder.mutation<Task, { parentId: number; data: Partial<Task> }>({
      query: ({ parentId, data }) => ({
        url: `/${task_api}/tasks/${parentId}/create_subtask/`,
        method: "POST",
        body: data,
      }),
    }),

    // Comments
    getTaskComments: builder.query<TaskComment[], number>({
      query: (taskId) => `/${task_api}/task-comments/?task_id=${taskId}`,
    }),

    createTaskComment: builder.mutation<TaskComment, { taskId: number; content: string }>({
      query: ({ taskId, content }) => ({
        url: `/${task_api}/task-comments/`,
        method: "POST",
        body: { task: taskId, content },
      }),
    }),

    updateTaskComment: builder.mutation<TaskComment, { id: number; content: string }>({
      query: ({ id, content }) => ({
        url: `/${task_api}/task-comments/${id}/`,
        method: "PATCH",
        body: { content },
      }),
    }),

    deleteTaskComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${task_api}/task-comments/${id}/`,
        method: "DELETE",
      }),
    }),

    // Attachments
    getTaskAttachments: builder.query<TaskAttachment[], number>({
      query: (taskId) => `/${task_api}/task-attachments/?task_id=${taskId}`,
    }),

    uploadTaskAttachment: builder.mutation<TaskAttachment, { taskId: number; file: File; filename: string }>({
      query: ({ taskId, file, filename }) => {
        const formData = new FormData()
        formData.append("task", taskId.toString())
        formData.append("file", file)
        formData.append("filename", filename)

        return {
          url: `/${task_api}/task-attachments/`,
          method: "POST",
          body: formData,
          formData: true,
        }
      },
    }),

    deleteTaskAttachment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${task_api}/task-attachments/${id}/`,
        method: "DELETE",
      }),
    }),

    // Time logs
    getTaskTimeLogs: builder.query<TaskTimeLog[], number>({
      query: (taskId) => `/${task_api}/task-time-logs/?task_id=${taskId}`,
    }),

    createTaskTimeLog: builder.mutation<TaskTimeLog, { taskId: number; minutes: number; description?: string }>({
      query: ({ taskId, minutes, description }) => ({
        url: `/${task_api}/task-time-logs/`,
        method: "POST",
        body: { task: taskId, minutes, description },
      }),
    }),

    updateTaskTimeLog: builder.mutation<TaskTimeLog, { id: number; minutes: number; description?: string }>({
      query: ({ id, minutes, description }) => ({
        url: `/${task_api}/task-time-logs/${id}/`,
        method: "PATCH",
        body: { minutes, description },
      }),
    }),

    deleteTaskTimeLog: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${task_api}/task-time-logs/${id}/`,
        method: "DELETE",
      }),
    }),

    // Statistics
    getTaskStatistics: builder.query<TaskStatistics, number | void>({
      query: (projectId) =>
        projectId
          ? `/${task_api}/tasks/statistics/?project_id=${projectId}`
          : `/${task_api}/tasks/statistics/`,
    }),
  }),
})

export const {
  // Basic CRUD
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  // Filtered queries
  useGetTasksByProjectQuery,
  useGetTasksByMilestoneQuery,
  useGetTasksByUserQuery,
  useGetSubtasksQuery,
  useGetTopLevelTasksQuery,
  useGetUpcomingTasksQuery,
  useGetOverdueTasksQuery,
  useGetFilteredTasksQuery,

  // Task tree
  useGetTaskTreeQuery,

  // Custom actions
  useCompleteTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskPercentageMutation,
  useAssignUsersToTaskMutation,
  useAddTimeToTaskMutation,
  useCreateSubtaskMutation,

  // Comments
  useGetTaskCommentsQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,

  // Attachments
  useGetTaskAttachmentsQuery,
  useUploadTaskAttachmentMutation,
  useDeleteTaskAttachmentMutation,

  // Time logs
  useGetTaskTimeLogsQuery,
  useCreateTaskTimeLogMutation,
  useUpdateTaskTimeLogMutation,
  useDeleteTaskTimeLogMutation,

  // Statistics
  useGetTaskStatisticsQuery,
} = taskApiSlice