/**
 * Shared types for the backoffice.
 * Import from here instead of individual service files when needed across multiple features.
 */

export type { LoginPayload, AuthResponse } from '../services/authService'
export type { BlogPost } from '../services/blogService'
export type { Project } from '../services/projectService'
export type { TeamMember } from '../services/teamService'
export type { Testimonial } from '../services/testimonialService'

/** Generic paginated API response wrapper */
export interface Paginated<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

/** Standard API error shape */
export interface ApiError {
    message: string
    errors?: Record<string, string[]>
}
