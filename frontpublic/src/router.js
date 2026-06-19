import { createRouter, createWebHistory } from 'vue-router'

// Routes — all page components are lazy-loaded via dynamic import().
const routes = [

    // Home variants
    { path: '/', name: 'index1', component: () => import('./pages/index/index1.vue'), meta: { title: 'Home One' } },
    { path: '/index2', name: 'index2', component: () => import('./pages/index/index2.vue'), meta: { title: 'Home Two' } },
    { path: '/index3', name: 'index3', component: () => import('./pages/index/index3.vue'), meta: { title: 'Home Three' } },
    { path: '/index4', name: 'index4', component: () => import('./pages/index/index4.vue'), meta: { title: 'Home Four' } },

    // One-page variants
    { path: '/index-one-page', name: 'IndexOnePage', component: () => import('./pages/headerOnePage/IndexOnePage.vue'), meta: { title: 'Home One Page' } },
    { path: '/index2-one-page', name: 'IndexTwoPage', component: () => import('./pages/headerOnePage/IndexTwoPage.vue'), meta: { title: 'Home Two Page' } },
    { path: '/index3-one-page', name: 'IndexThreePage', component: () => import('./pages/headerOnePage/IndexThreePage.vue'), meta: { title: 'Home Three Page' } },
    { path: '/index4-one-page', name: 'IndexFourPage', component: () => import('./pages/headerOnePage/IndexFourPage.vue'), meta: { title: 'Home Four Page' } },

    // General pages
    { path: '/about', name: 'about', component: () => import('./pages/About.vue'), meta: { title: 'About Us' } },
    { path: '/team', name: 'team', component: () => import('./pages/Team.vue'), meta: { title: 'Our Team' } },
    { path: '/team-details', name: 'team-details', component: () => import('./pages/TeamDetails.vue'), meta: { title: 'Team Details' } },
    { path: '/testimonials', name: 'testimonials', component: () => import('./pages/Testimonials.vue'), meta: { title: 'Testimonials' } },
    { path: '/faq', name: 'faq', component: () => import('./pages/Faq.vue'), meta: { title: 'FAQ' } },
    { path: '/404', name: 'error404', component: () => import('./pages/Error404.vue'), meta: { title: '404 - Page Not Found' } },
    { path: '/coming-soon', name: 'coming-soon', component: () => import('./pages/ComingSoon.vue'), meta: { title: 'Coming Soon' } },

    // Services
    { path: '/services', name: 'services', component: () => import('./pages/services/Services.vue'), meta: { title: 'Our Services' } },
    { path: '/evolve-space-designs', name: 'evolve-space-designs', component: () => import('./pages/services/EvolveSpaceDesigns.vue'), meta: { title: 'Evolve Space Designs' } },
    { path: '/eden-home-styling', name: 'eden-home-styling', component: () => import('./pages/services/EdenHomeStyling.vue'), meta: { title: 'Eden Home Styling' } },
    { path: '/harmony-interiors', name: 'harmony-interiors', component: () => import('./pages/services/HarmonyInteriors.vue'), meta: { title: 'Harmony Interiors' } },
    { path: '/interior-design', name: 'interior-design', component: () => import('./pages/services/InteriorDesign.vue'), meta: { title: 'Interior Design' } },
    { path: '/urban-design', name: 'urban-design', component: () => import('./pages/services/UrbanDesign.vue'), meta: { title: 'Urban Design' } },
    { path: '/landscape-design', name: 'landscape-design', component: () => import('./pages/services/LandscapeDesign.vue'), meta: { title: 'Landscape Design' } },

    // Projects
    { path: '/projects', name: 'projects', component: () => import('./pages/projects/Projects.vue'), meta: { title: 'Our Projects' } },
    { path: '/project-details', name: 'project-details', component: () => import('./pages/projects/ProjectDetails.vue'), meta: { title: 'Project Details' } },

    // Blog
    { path: '/blog', name: 'blog', component: () => import('./pages/blog/Blog.vue'), meta: { title: 'Blog' } },
    { path: '/blog-2', name: 'blog-2', component: () => import('./pages/blog/Blog2.vue'), meta: { title: 'Blog' } },
    { path: '/blog-details', name: 'blog-details', component: () => import('./pages/blog/BlogDetails.vue'), meta: { title: 'Blog Details' } },

    // Contact
    { path: '/contact', name: 'contact', component: () => import('./pages/Contact.vue'), meta: { title: 'Contact Us' } },

    // Catch-all 404 — must remain last
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/Error404.vue'), meta: { title: '404 - Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Update page title on route change
router.afterEach((to) => {
    const baseTitle = 'Tecture - Architecture & Interior Vue Js Template';
    const pageTitle = to.meta.title || 'Home';
    document.title = `${pageTitle} || ${baseTitle}`;
});

export default router
