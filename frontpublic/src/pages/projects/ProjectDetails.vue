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
        title="Project Details"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <ProjectDetailsContent 
        :title="projectData.title"
        :mainImage="projectData.mainImage"
        :sideImage="projectData.sideImage"
        :description1="projectData.description1"
        :description2="projectData.description2"
        :description3="projectData.description3"
        :faqs="projectData.faqs"
      />

      <BrandOne />

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
import ProjectDetailsContent from '@/components/projects/ProjectDetailsContent.vue';
import BrandOne from '@/components/home-one/BrandOne.vue';

import mainImage from '@/assets/images/project/project-details-img-1.jpg';
import sideImage from '@/assets/images/project/project-details-img-box-img.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Project Details', link: '' }
];

const projectData = {
    title: 'Projects Details',
    mainImage: mainImage,
    sideImage: sideImage,
    description1: 'To be clear, Project Online is NOT a web-based version of Project Professional. Project Online is an entirely separate service that offers full portfolio and project management tools on the web. It includes Project Web App, and can, depending on your subscription, also include Project Online Desktop Client, which is a Discover Community. Explore subscription benefits, browse training courses, learn how to secure',
    description2: 'To be clear, Project Online is NOT a web-based version of Project Professional. Project Online is an entirely separate service that offers full portfolio and project management tools on the web. It includes Project Web App, and can, depending on your subscription, also include Project Online',
    description3: 'To be clear, Project Online is NOT a web-based version of Project Professional. Project Online is an entirely separate service that offers full portfolio and project management tools on the web. It includes Project Web App, and can, depending on your subscription, also include Project Online Desktop Client, which is a Discover Community. Explore subscription benefits, browse training courses, learn how to secure',
    faqs: [
        {
            question: 'What is the latest technology trend in the ?',
            answer: 'The time it takes to repair a roof depends on the extent of the damage. For minor repairs, it might take an hour or two. For significant repairs, A or team might be at your home for half a day.'
        },
        {
            question: 'How to Create my Project in Company?',
            answer: 'The time it takes to repair a roof depends on the extent of the damage. For minor repairs, it might take an hour or two. For significant repairs, A or team might be at your home for half a day.'
        },
        {
            question: 'How can IT services benefit my business?',
            answer: 'The time it takes to repair a roof depends on the extent of the damage. For minor repairs, it might take an hour or two. For significant repairs, A or team might be at your home for half a day.'
        },
        {
            question: 'What warranties do I have for installation?',
            answer: 'The time it takes to repair a roof depends on the extent of the damage. For minor repairs, it might take an hour or two. For significant repairs, A or team might be at your home for half a day.'
        }
    ]
};
</script>
