import api from './api'

/**
 * Services (interior design, landscape, etc.)
 */
export const serviceService = {
    getAll: () => api.get('/services'),
    getOne: (id) => api.get(`/services/${id}`),
}
