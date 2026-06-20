import { ref } from 'vue'

/**
 * Generic composable for data fetching.
 *
 * Usage:
 *   const { data, loading, error, execute } = useFetch(() => blogService.getAll())
 *   onMounted(() => execute())
 */
export function useFetch(fn) {
    const data = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const execute = async (...args) => {
        loading.value = true
        error.value = null
        try {
            data.value = await fn(...args)
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    return { data, loading, error, execute }
}
