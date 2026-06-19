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
        title="Blog"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <BlogGrid :blogs="blogs" />

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
import BlogGrid from '@/components/blog/BlogGrid.vue';

import blog1 from '@/assets/images/blog/blog-1-1.jpg';
import blog2 from '@/assets/images/blog/blog-1-2.jpg';
import blog3 from '@/assets/images/blog/blog-1-3.jpg';
import blog4 from '@/assets/images/blog/blog-1-4.jpg';
import blog5 from '@/assets/images/blog/blog-1-5.jpg';
import blog6 from '@/assets/images/blog/blog-1-6.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Blog', link: '' }
];

const blogs = [
    {
        image: blog1,
        day: '23',
        month: 'Sep 2024',
        title: 'Top 10 Modern Building Design in Califronia, USA',
        link: '/blog-details',
        delay: '100ms'
    },
    {
        image: blog2,
        day: '13',
        month: 'Sep 2024',
        title: 'It is a long established fact that a reader will',
        link: '/blog-details',
        delay: '200ms'
    },
    {
        image: blog3,
        day: '04',
        month: 'Sep 2024',
        title: 'Lorem Ipsum is simply dummy text of the printing',
        link: '/blog-details',
        delay: '300ms'
    },
    {
        image: blog4,
        day: '09',
        month: 'Sep 2024',
        title: 'It is a long established fact that a reader',
        link: '/blog-details',
        delay: '400ms'
    },
    {
        image: blog5,
        day: '25',
        month: 'Sep 2024',
        title: 'A corporate business entity is an oit organization',
        link: '/blog-details',
        delay: '500ms'
    },
    {
        image: blog6,
        day: '28',
        month: 'Sep 2024',
        title: 'Rapidiously evolve pandemic experiences',
        link: '/blog-details',
        delay: '600ms'
    }
];
</script>
