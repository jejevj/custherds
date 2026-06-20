import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // Home
    { path: '/', name: 'home', component: () => import('./pages/index/index2.vue'), meta: { title: 'Home' } },

    // General pages
    { path: '/about',   name: 'about',   component: () => import('./pages/About.vue'),   meta: { title: 'About Us' } },
    { path: '/contact', name: 'contact', component: () => import('./pages/Contact.vue'), meta: { title: 'Contact Us' } },

    // Tour Guides — public
    { path: '/tour-guides', name: 'tour-guides', component: () => import('./pages/TourGuides.vue'), meta: { title: 'Find a Guide' } },

    // Register — partner/vendor default, tourist via /tourist/register
    { path: '/register',          name: 'register',          component: () => import('./pages/Register.vue'), meta: { title: 'Register' } },
    { path: '/tourist/register',  name: 'tourist-register',  component: () => import('./pages/Register.vue'), meta: { title: 'Join as Traveller' } },

    // Login
    { path: '/login',         name: 'login',         component: () => import('./pages/Login.vue'),       meta: { title: 'Login' } },
    { path: '/tourist/login', name: 'tourist-login', component: () => import('./pages/TouristAuth.vue'), meta: { title: 'Traveller Sign In' } },

    // Utility
    { path: '/404',         name: 'error404',    component: () => import('./pages/Error404.vue'),   meta: { title: '404 - Page Not Found' } },
    { path: '/coming-soon', name: 'coming-soon', component: () => import('./pages/ComingSoon.vue'), meta: { title: 'Coming Soon' } },

    // Catch-all 404
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/Error404.vue'), meta: { title: '404 - Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.afterEach((to) => {
    document.title = `${to.meta.title || 'Home'} | Custherds`;
});

export default router
