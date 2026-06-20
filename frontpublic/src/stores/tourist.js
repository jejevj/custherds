/**
 * tourist.js — Pinia store for tourist auth state.
 * Persists to localStorage so login survives page refresh.
 */
import { defineStore } from 'pinia';

export const useTouristStore = defineStore('tourist', {
    state: () => ({
        token: localStorage.getItem('tourist_token') || null,
        user: JSON.parse(localStorage.getItem('tourist_user') || 'null'),
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        fullName: (state) => state.user?.name || '',
    },

    actions: {
        login(token, user) {
            this.token = token;
            this.user = user;
            localStorage.setItem('tourist_token', token);
            localStorage.setItem('tourist_user', JSON.stringify(user));
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('tourist_token');
            localStorage.removeItem('tourist_user');
        },
    },
});
