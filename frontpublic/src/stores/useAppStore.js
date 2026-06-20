import { defineStore } from 'pinia'

/**
 * Global app store — loading state, notifications, etc.
 * Install Pinia: npm install pinia
 * Register in main.js: app.use(createPinia())
 */
export const useAppStore = defineStore('app', {
    state: () => ({
        isLoading: false,
        notification: null, // { type: 'success' | 'error', message: '' }
    }),
    actions: {
        setLoading(val) {
            this.isLoading = val
        },
        notify(type, message) {
            this.notification = { type, message }
            setTimeout(() => { this.notification = null }, 4000)
        },
    },
})
