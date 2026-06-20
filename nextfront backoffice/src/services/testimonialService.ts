import { api } from './api'

export interface Testimonial {
    id: number
    name: string
    position: string
    message: string
    rating: number
    photo: string
}

export const testimonialService = {
    getAll: () => api.get<Testimonial[]>('/testimonials'),
    create: (data: Partial<Testimonial>) => api.post<Testimonial>('/testimonials', data),
    update: (id: number, data: Partial<Testimonial>) => api.put<Testimonial>(`/testimonials/${id}`, data),
    remove: (id: number) => api.delete<void>(`/testimonials/${id}`),
}
