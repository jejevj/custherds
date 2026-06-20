import { api } from './api'

export interface Project {
    id: number
    title: string
    description: string
    thumbnail: string
    category: string
    completed_at: string
}

export const projectService = {
    getAll: (params?: Record<string, string>) =>
        api.get<Project[]>('/projects', { params }),
    getOne: (id: number) =>
        api.get<Project>(`/projects/${id}`),
    create: (data: Partial<Project>) =>
        api.post<Project>('/projects', data),
    update: (id: number, data: Partial<Project>) =>
        api.put<Project>(`/projects/${id}`, data),
    remove: (id: number) =>
        api.delete<void>(`/projects/${id}`),
}
