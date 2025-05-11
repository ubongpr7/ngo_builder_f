import { apiSlice } from "../../services/apiSlice"
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from "@/types/tasks"

const tasks_api = "api/v1/tasks"

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tasks
    getTasks: builder.query<Task[], void>({
      query: () => `/${tasks_api}/`,
      
    }),

    // Get top-level tasks
    getTopLevelTasks: builder.query<Task[], void>({
      query: () => `/${tasks_api}/?top_level=true`,
      
    }),

    // Get tasks by status
    getTasksByStatus: builder.query<Task[], TaskStatus>({
      query: (status) => `/${tasks_api}/?status=${status}`,
      
    }),

    // Get tasks by priority
    getTasksByPriority: builder.query<Task[], TaskPriority>({
      query: (priority) => `/${tasks_api}/?priority=${priority}`,
      
    }),

    // Get a single task by ID
    getTask: builder.query<Task, number>({
      query: (id) => `/${tasks_api}/${id}/`,
      
    }),

    // Get subtasks for a task
    getSubtasks: builder.query<Task[], number>({
      query: (taskId) => `/${tasks_api}/${taskId}/subtasks/`,
      
    }),

    // Get tasks by project
    getTasksByProject: builder.query<Task[], number>({
      query: (projectId) => `/${tasks_api}/?project=${projectId}&top_level=true`,
      
    }),
    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${tasks_api}/${id}/`,
        method: "DELETE",
      }),
    }),
    completeTask: builder.mutation<Task, number>({
      query: (id) => ({
        url: `/${tasks_api}/${id}/complete/`,
        method: "POST",
      }),
    }),

    // Get tasks by milestone
    getTasksByMilestone: builder.query<Task[], number>({
      query: (milestoneId) => `/${tasks_api}/?milestone=${milestoneId}`,
      
    }),

    // Get tasks assigned to current user
    getMyTasks: builder.query<Task[], void>({
      query: () => `/${tasks_api}/my_tasks/`,
    }),

    // Get overdue tasks
    getOverdueTasks: builder.query<Task[], void>({
      query: () => `/${tasks_api}/overdue/`,
    }),

    // Create a new task
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (data) => ({
        url: `/${tasks_api}/`,
        method: "POST",
        body: data,
      }),
      
    }),

    // Update an existing task
    updateTask: builder.mutation<Task, { id: number; data: UpdateTaskRequest }>({
      query: ({ id, data }) => ({
        url: `/${tasks_api}/${id}/`,
        method: "PATCH",
        body: data,
      }),
     
    }),

    // Add a subtask to a task
    addSubtask: builder.mutation<Task, { parentId: number; data: CreateTaskRequest }>({
      query: ({ parentId, data }) => ({
        url: `/${tasks_api}/${parentId}/add_subtask/`,
        method: "POST",
        body: data,
      }),
      
    }),

    // Assign a user to a task
    assignUser: builder.mutation<void, { taskId: number; userId: number }>({
      query: ({ taskId, userId }) => ({
        url: `/${tasks_api}/${taskId}/assign/`,
        method: "POST",
        body: { user_id: userId },
      }),
      
    }),

    // Unassign a user from a task
    unassignUser: builder.mutation<void, { taskId: number; userId: number }>({
      query: ({ taskId, userId }) => ({
        url: `/${tasks_api}/${taskId}/unassign/`,
        method: "POST",
        body: { user_id: userId },
      }),
      
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTopLevelTasksQuery,
  useGetTasksByStatusQuery,
  useGetTasksByPriorityQuery,
  useGetTaskQuery,
  useGetSubtasksQuery,
  useGetTasksByProjectQuery,
  useGetTasksByMilestoneQuery,
  useGetMyTasksQuery,
  useGetOverdueTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useAddSubtaskMutation,
  useAssignUserMutation,
  useUnassignUserMutation,
} = tasksApiSlice
