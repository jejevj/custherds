<template>
  <div>
    <Preloader />
    <ChatPopup />

    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>

    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />

      <PageHeader 
        title="Projects"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <ProjectsGrid :projects="projects" />

      <Footer1 />
    </div>

    <MobileNav />
    <SearchPopup />
    <ScrollToTop />
  </div>
</template>

<script setup>
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';
import ProjectsGrid from '@/components/projects/ProjectsGrid.vue';

import project1 from '@/assets/images/project/projects-2-1.jpg';
import project2 from '@/assets/images/project/projects-2-2.jpg';
import project3 from '@/assets/images/project/projects-2-3.jpg';
import project4 from '@/assets/images/project/projects-2-4.jpg';
import project5 from '@/assets/images/project/projects-2-5.jpg';
import project6 from '@/assets/images/project/projects-2-6.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Projects', link: '' }
];

const projects = [
    {
        id: 1,
        title: 'Industrial Chic Restaurant',
        image: project1,
        link: '/project-details'
    },
    {
        id: 2,
        title: 'Amman Rotane Hotel',
        image: project2,
        link: '/project-details'
    },
    {
        id: 3,
        title: 'Harmony Interiors',
        image: project3,
        link: '/project-details'
    },
    {
        id: 4,
        title: 'Harmony Interiors',
        image: project4,
        link: '/project-details'
    },
    {
        id: 5,
        title: 'Amman Rotane Hotel',
        image: project5,
        link: '/project-details'
    },
    {
        id: 6,
        title: 'Industrial Chic Restaurant',
        image: project6,
        link: '/project-details'
    }
];
</script>
