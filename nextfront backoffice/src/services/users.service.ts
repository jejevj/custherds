import { api } from './api'
import { User } from '@/types/user.types'

export const getUsers = (user_type?: number): Promise<User[]> =>
  api.get('/admin/users', { params: user_type !== undefined ? { user_type } : undefined })

export const toggleUserActive = (userId: string, is_active: boolean): Promise<{ message: string }> =>
  api.put(`/admin/users/${userId}/activate`, null, { params: { is_active } })
