import { api } from './api'

export interface BlogPost {
    id: number
    title: string
    slug: string
    content: string
    thumbnail: string
    published_at: string
}

export const blogService = {
    getAll: (params?: Record<string, string>) =>
        api.get<BlogPost[]>('/blogs', { params }),
    getOne: (id: number) =>
        api.get<BlogPost>(`/blogs/${id}`),
    create: (data: Partial<BlogPost>) =>
        api.post<BlogPost>('/blogs', data),
    update: (id: number, data: Partial<BlogPost>) =>
        api.put<BlogPost>(`/blogs/${id}`, data),
    remove: (id: number) =>
        api.delete<void>(`/blogs/${id}`),
}
