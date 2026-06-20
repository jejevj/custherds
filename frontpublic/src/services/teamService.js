import api from './api'

/**
 * Team members service
 */
export const teamService = {
    getAll: () => api.get('/team'),
    getOne: (id) => api.get(`/team/${id}`),
}
