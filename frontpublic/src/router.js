import { createRouter, createWebHistory } from 'vue-router'

// Routes — all page components are lazy-loaded via dynamic import().
const routes = [

    // Home
    { path: '/', name: 'home', component: () => import('./pages/index/index2.vue'), meta: { title: 'Home' } },

    // General pages
    { path: '/about', name: 'about', component: () => import('./pages/About.vue'), meta: { title: 'About Us' } },
    { path: '/contact', name: 'contact', component: () => import('./pages/Contact.vue'), meta: { title: 'Contact Us' } },

    // Tour Guides
    { path: '/tour-guides', name: 'tour-guides', component: () => import('./pages/TourGuides.vue'), meta: { title: 'Find a Guide' } },

    // Auth
    { path: '/register', name: 'register', component: () => import('./pages/Register.vue'), meta: { title: 'Register' } },
    { path: '/login', name: 'login', component: () => import('./pages/Login.vue'), meta: { title: 'Login' } },

    // Utility
    { path: '/404', name: 'error404', component: () => import('./pages/Error404.vue'), meta: { title: '404 - Page Not Found' } },
    { path: '/coming-soon', name: 'coming-soon', component: () => import('./pages/ComingSoon.vue'), meta: { title: 'Coming Soon' } },

    // Catch-all 404 — must remain last
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/Error404.vue'), meta: { title: '404 - Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Update page title on route change
router.afterEach((to) => {
    const baseTitle = 'Custherds';
    const pageTitle = to.meta.title || 'Home';
    document.title = `${pageTitle} | ${baseTitle}`;
});

export default router
