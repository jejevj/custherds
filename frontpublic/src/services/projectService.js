import api from './api'

/**
 * Project / portfolio service
 */
export const projectService = {
    getAll: (params = {}) => api.get('/projects', { params }),
    getOne: (id) => api.get(`/projects/${id}`),
}
