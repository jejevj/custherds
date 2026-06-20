import api from './api'

/**
 * Contact form service
 */
export const contactService = {
    /** Submit contact form */
    send: (payload) => api.post('/contact', payload),
}
