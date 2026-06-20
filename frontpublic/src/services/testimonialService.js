import api from './api'

/**
 * Testimonials service
 */
export const testimonialService = {
    getAll: () => api.get('/testimonials'),
}
