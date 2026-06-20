import api from './api'

/**
 * Blog service
 * Replace dummy data with actual API calls when backend is ready.
 */
export const blogService = {
    /** Get paginated list of blog posts */
    getAll: (params = {}) => api.get('/blogs', { params }),

    /** Get single blog post by slug or id */
    getOne: (id) => api.get(`/blogs/${id}`),
}
