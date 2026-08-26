import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('habitflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('habitflow_token')
      window.dispatchEvent(new Event('habitflow:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const messageFromError = (error) => error.response?.data?.message
  || (error.request ? 'Cannot reach the HabitFlow server. Start the backend on port 5000 and try again.' : 'Something went wrong. Please try again.')
export default api
