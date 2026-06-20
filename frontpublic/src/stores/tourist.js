/**
 * tourist.js — Lightweight reactive auth state for tourists.
 * No Pinia / Vuex needed. Uses Vue's reactive() + localStorage.
 * Import useTouristStore() anywhere in the app.
 */
import { reactive, computed } from 'vue';

const _state = reactive({
    token: localStorage.getItem('tourist_token') || null,
    user:  JSON.parse(localStorage.getItem('tourist_user') || 'null'),
});

export function useTouristStore() {
    const isLoggedIn = computed(() => !!_state.token);
    const fullName   = computed(() => _state.user?.name || '');

    function login(token, user) {
        _state.token = token;
        _state.user  = user;
        localStorage.setItem('tourist_token', token);
        localStorage.setItem('tourist_user', JSON.stringify(user));
    }

    function logout() {
        _state.token = null;
        _state.user  = null;
        localStorage.removeItem('tourist_token');
        localStorage.removeItem('tourist_user');
    }

    return { isLoggedIn, fullName, login, logout };
}
