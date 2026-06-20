import { defineStore } from 'pinia'
import { blogService } from '../services/blogService'

export const useBlogStore = defineStore('blog', {
    state: () => ({
        posts: [],
        currentPost: null,
        loading: false,
        error: null,
    }),
    actions: {
        async fetchAll(params) {
            this.loading = true
            try {
                this.posts = await blogService.getAll(params)
            } catch (err) {
                this.error = err
            } finally {
                this.loading = false
            }
        },
        async fetchOne(id) {
            this.loading = true
            try {
                this.currentPost = await blogService.getOne(id)
            } catch (err) {
                this.error = err
            } finally {
                this.loading = false
            }
        },
    },
})
