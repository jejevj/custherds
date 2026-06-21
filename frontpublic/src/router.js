import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // Home
    { path: '/', name: 'home', component: () => import('./pages/index/index2.vue'), meta: { title: 'Home' } },

    // General pages
    { path: '/about',   name: 'about',   component: () => import('./pages/About.vue'),   meta: { title: 'About Us' } },
    { path: '/contact', name: 'contact', component: () => import('./pages/Contact.vue'), meta: { title: 'Contact Us' } },
    { path: '/faq',     name: 'faq',     component: () => import('./pages/Faq.vue'),     meta: { title: 'FAQ' } },
    { path: '/terms',   name: 'terms',   component: () => import('./pages/Terms.vue'),   meta: { title: 'Terms & Conditions' } },

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
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        if (to.hash) {
            return { el: to.hash, behavior: 'smooth' }
        }
        return { top: 0, behavior: 'smooth' }
    },
})

router.afterEach((to) => {
    document.title = `${to.meta.title || 'Home'} | Custherds`;
});

export default router
