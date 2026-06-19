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
        title="Blog standard"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <section class="blog-details">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="auto-container">
          <div class="row">
            <div class="col-xl-8 col-lg-7">
              <div class="blog-page-content">
                <BlogListCard
                  v-for="(blog, index) in blogs"
                  :key="index"
                  :image="blog.image"
                  :day="blog.day"
                  :month="blog.month"
                  :author="blog.author"
                  :comments="blog.comments"
                  :title="blog.title"
                  :excerpt="blog.excerpt"
                  :link="blog.link"
                />

                <BlogPagination 
                  :currentPage="currentPage"
                  :totalPages="totalPages"
                  @page-change="handlePageChange"
                />
              </div>
            </div>

            <div class="col-xl-4 col-lg-5">
              <BlogSidebar
                :latestPosts="latestPosts"
                :categories="categories"
                :tags="tags"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </div>

    <MobileNav />
    <SearchPopup />
    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';
import BlogListCard from '@/components/blog/BlogListCard.vue';
import BlogSidebar from '@/components/blog/BlogSidebar.vue';
import BlogPagination from '@/components/blog/BlogPagination.vue';

import sectionShape from '@/assets/images/shapes/blog-details-sec-shape-1.png';
import blog1 from '@/assets/images/blog/blog-page-2-1.jpg';
import blog2 from '@/assets/images/blog/blog-page-2-2.jpg';
import blog3 from '@/assets/images/blog/blog-page-2-3.jpg';
import blog4 from '@/assets/images/blog/blog-page-2-4.jpg';
import blog5 from '@/assets/images/blog/blog-page-2-5.jpg';
import latestPost1 from '@/assets/images/blog/lp-1-1.jpg';
import latestPost2 from '@/assets/images/blog/lp-1-2.jpg';
import latestPost3 from '@/assets/images/blog/lp-1-3.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Blog Details', link: '' }
];

const currentPage = ref(1);
const totalPages = ref(3);

const blogs = [
    {
        image: blog1,
        day: '23',
        month: 'Sep 2024',
        author: 'David Wood',
        comments: '1k',
        title: 'Top 10 Modern Building Design in Califronia, USA',
        excerpt: 'Architecture is one of the most multidisciplinary fields out there, integrating landscape design, interior design, urban planning, history and philosophy, to name just a few.',
        link: '/blog-details'
    },
    {
        image: blog2,
        day: '13',
        month: 'Sep 2024',
        author: 'David Wood',
        comments: '10k',
        title: 'It is a long established fact that a reader will',
        excerpt: 'Architecture is one of the most multidisciplinary fields out there, integrating landscape design, interior design, urban planning, history and philosophy, to name just a few.',
        link: '/blog-details'
    },
    {
        image: blog3,
        day: '20',
        month: 'Nov 2024',
        author: 'David Wood',
        comments: '5k',
        title: 'Inspiring Designs for Inspired Where InnovationMeet',
        excerpt: 'Architecture is one of the most multidisciplinary fields out there, integrating landscape design, interior design, urban planning, history and philosophy, to name just a few.',
        link: '/blog-details'
    },
    {
        image: blog4,
        day: '24',
        month: 'Jun 2024',
        author: 'David Wood',
        comments: '15k',
        title: 'The best drawings make amazing structures',
        excerpt: 'Architecture is one of the most multidisciplinary fields out there, integrating landscape design, interior design, urban planning, history and philosophy, to name just a few.',
        link: '/blog-details'
    },
    {
        image: blog5,
        day: '10',
        month: 'April 2024',
        author: 'David Wood',
        comments: '1b',
        title: 'Highly-trained architects ready to serve',
        excerpt: 'Architecture is one of the most multidisciplinary fields out there, integrating landscape design, interior design, urban planning, history and philosophy, to name just a few.',
        link: '/blog-details'
    }
];

const latestPosts = [
    {
        image: latestPost1,
        date: 'July 24, 2024',
        title: 'Top crypto exchange influencers',
        link: '/blog-details'
    },
    {
        image: latestPost2,
        date: 'July 24, 2024',
        title: 'Mauris non dignissim commodo Instralation',
        link: '/blog-details'
    },
    {
        image: latestPost3,
        date: 'July 24, 2024',
        title: 'Donec sit amet lacinia Instralation nulla.',
        link: '/blog-details'
    }
];

const categories = [
    { name: 'New Technologies', count: '07' },
    { name: 'Construction Introductions', count: '05' },
    { name: 'Instralation Accecories', count: '03' },
    { name: 'Business Advice', count: '07' },
    { name: 'Payment Processing', count: '08' },
    { name: 'Corporate Standup', count: '04' }
];

const tags = [
    'All Project',
    'Interiour',
    'Business',
    'Graphics',
    'Cargo',
    'Maintenance',
    'Consulting'
];

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Scroll to top or load new content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
</script>
