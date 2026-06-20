import axios from 'axios'

/**
 * Base axios instance.
 * Set VITE_API_BASE_URL in your .env file.
 * Example: VITE_API_BASE_URL=https://api.custherds.com/api
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Request interceptor — attach token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — global error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status
        if (status === 401) {
            // TODO: redirect to login or refresh token
            localStorage.removeItem('token')
        }
        return Promise.reject(error.response?.data || error.message)
    }
)

export default api
