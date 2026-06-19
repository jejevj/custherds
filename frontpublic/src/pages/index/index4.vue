<template>
    <div>
         <Preloader v-if="loading" />
        <ChatPopup />

        <div class="theme-border-left"></div>
        <div class="theme-border-right"></div>

        <SidebarWidget />

        <div class="page-wrapper">
            <HeaderTwo />
            <MainSliderFour />
            <WelcomeOne />
            <SloganOne />
            <ServicesFour />
            <TestimonialThree />
            <BlogFour />
            <FooterFour />
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
import MainSliderFour from '@/components/home-four/MainSliderFour.vue';
import WelcomeOne from '@/components/home-four/WelcomeOne.vue';
import SloganOne from '@/components/home-four/SloganOne.vue';
import ServicesFour from '@/components/home-four/ServicesFour.vue';
import TestimonialThree from '@/components/home-four/TestimonialThree.vue';
import BlogFour from '@/components/home-four/BlogFour.vue';
import FooterFour from '@/components/home-four/FooterFour.vue';
</script>
