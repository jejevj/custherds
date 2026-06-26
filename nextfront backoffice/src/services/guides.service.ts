import { api } from './api'
import { Guide } from '@/types/guide.types'

export const getGuides = (): Promise<Guide[]> =>
  api.get('/guides')

export const getGuide = (id: string): Promise<Guide> =>
  api.get(`/guides/${id}`)
