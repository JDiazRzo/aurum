import axios from 'axios'

console.log('API URL:', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurum_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aurum_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
}

export const transactionService = {
  getAll:     (params)       => api.get('/transactions', { params }),
  getOne:     (id)           => api.get(`/transactions/${id}`),
  create:     (data)         => api.post('/transactions', data),
  update:     (id, data)     => api.put(`/transactions/${id}`, data),
  remove:     (id)           => api.delete(`/transactions/${id}`),
  summary:    (params)       => api.get('/transactions/summary', { params }),
  anomalies:  ()             => api.get('/transactions/anomalies'),
  categorize: (id, category_id) => api.patch(`/transactions/${id}/category`, { category_id }),
}

export const budgetService = {
  getAll:     ()           => api.get('/budgets'),
  getByMonth: (year, month)=> api.get(`/budgets/${year}/${month}`),
  create:     (data)       => api.post('/budgets', data),
  update:     (id, data)   => api.put(`/budgets/${id}`, data),
  remove:     (id)         => api.delete(`/budgets/${id}`),
}

export const categoryService = {
  getAll:  ()         => api.get('/categories'),
  create:  (data)     => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  remove:  (id)       => api.delete(`/categories/${id}`),
}

export const profileService = {
  getMe:    ()     => api.get('/profiles/me'),
  updateMe: (data) => api.put('/profiles/me', data),
}


api.interceptors.request.use((config) => {
  console.log('Request:', config.method.toUpperCase(), config.baseURL + config.url)
  const token = localStorage.getItem('aurum_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})