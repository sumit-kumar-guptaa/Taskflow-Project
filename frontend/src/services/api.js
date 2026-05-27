import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const msg = err.response?.data?.message || 'Something went wrong'
    toast.error(msg)
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Users
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getAll: () => api.get('/users'),
  search: (q) => api.get(`/users/search?q=${q}`),
}

// Teams
export const teamsAPI = {
  create: (data) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams'),
  getAll: () => api.get('/teams/all'),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members/${userId}`),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
}

// Projects
export const projectsAPI = {
  create: (data) => api.post('/projects', data),
  getMyProjects: () => api.get('/projects'),
  getAll: () => api.get('/projects/all'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

// Tasks
export const tasksAPI = {
  create: (data) => api.post('/tasks', data),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getMyTasks: () => api.get('/tasks/my'),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  search: (q) => api.get(`/tasks/search?q=${q}`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  deleteComment: (commentId) => api.delete(`/tasks/comments/${commentId}`),
}

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

export default api
