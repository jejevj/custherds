export const navItems = [
    {
        name: 'Home',
        path: '/',
        dropdown: false,
        subItems: []
    },
    {
        name: 'About Us',
        path: '/about',
        dropdown: false,
        subItems: []
    },
    {
        name: 'Pages',
        path: '#',
        dropdown: true,
        subItems: [
            { name: 'Team', path: '/team' },
            { name: 'Team Details', path: '/team-details' },
            { name: 'Testimonials', path: '/testimonials' },
            { name: 'Faq', path: '/faq' },
            { name: '404 Error', path: '/404' },
            { name: 'Coming Soon', path: '/coming-soon' },
        ]
    },
    {
        name: 'Services',
        path: '#',
        dropdown: true,
        subItems: [
            { name: 'Services', path: '/services' },
            { name: 'Evolve Space Designs', path: '/evolve-space-designs' },
            { name: 'Eden Home Styling', path: '/eden-home-styling' },
            { name: 'Harmony Interiors', path: '/harmony-interiors' },
            { name: 'Interior Design', path: '/interior-design' },
            { name: 'Urban Design', path: '/urban-design' },
            { name: 'Landscape Design', path: '/landscape-design' },
        ]
    },
    {
        name: 'Projects',
        path: '#',
        dropdown: true,
        subItems: [
            { name: 'Projects', path: '/projects' },
            { name: 'Project Details', path: '/project-details' },
        ]
    },
    {
        name: 'Blog',
        path: '#',
        dropdown: true,
        subItems: [
            { name: 'Blog', path: '/blog' },
            { name: 'Blog Style2', path: '/blog-2' },
            { name: 'Blog Details', path: '/blog-details' },
        ]
    },
    {
        name: 'Contact',
        path: '/contact',
        dropdown: false,
        subItems: []
    }
];
