import { api } from './api'

export interface TeamMember {
    id: number
    name: string
    role: string
    bio: string
    photo: string
}

export const teamService = {
    getAll: () => api.get<TeamMember[]>('/team'),
    getOne: (id: number) => api.get<TeamMember>(`/team/${id}`),
    create: (data: Partial<TeamMember>) => api.post<TeamMember>('/team', data),
    update: (id: number, data: Partial<TeamMember>) => api.put<TeamMember>(`/team/${id}`, data),
    remove: (id: number) => api.delete<void>(`/team/${id}`),
}
