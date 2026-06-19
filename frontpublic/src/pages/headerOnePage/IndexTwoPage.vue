<template>
    <div>
        <Preloader v-if="loading" />
        <ChatPopup />

        <div class="theme-border-left"></div>
        <div class="theme-border-right"></div>
        
        <SidebarWidget />
        
        <div class="page-wrapper">
            <HeaderTwoPage />
            
            <MainSliderTwo id="home" />
            <FeatureTwo />
            <AboutTwo id="about" />
            <CounterOne id="counter" />
            <ProjectTwo id="projects" />
            <ServicesTwo id="services" />
            <TeamOne />
            <TestimonialTwo />
            <ContactOne id="contact" />
            <BlogTwo id="blog" />
            
            <Footer1 />
        </div>

        <MobileNav />
        <SearchPopup />
        <ScrollToTop />
    </div>
</template>

<script>
import Preloader from "@/components/common/Preloader.vue";
import ChatPopup from "@/components/common/ChatPopup.vue";
import SidebarWidget from "@/components/common/SidebarWidget.vue";
import HeaderTwoPage from "@/components/layout/header/HeaderTwoPage.vue";
import MainSliderTwo from "@/components/home-two/MainSliderTwo.vue";
import FeatureTwo from "@/components/home-two/FeatureTwo.vue";
import AboutTwo from "@/components/home-two/AboutTwo.vue";
import CounterOne from "@/components/home-two/CounterOne.vue";
import ProjectTwo from "@/components/home-two/ProjectTwo.vue";
import ServicesTwo from "@/components/home-two/ServicesTwo.vue";
import TeamOne from "@/components/home-two/TeamOne.vue";
import TestimonialTwo from "@/components/home-two/TestimonialTwo.vue";
import ContactOne from "@/components/home-two/ContactOne.vue";
import BlogTwo from "@/components/home-two/BlogTwo.vue";
import Footer1 from "@/components/layout/footer/Footer1.vue";
import MobileNav from "@/components/common/MobileNav.vue";
import SearchPopup from "@/components/common/SearchPopup.vue";
import ScrollToTop from "@/components/common/ScrollToTop.vue";

export default {
    name: "Index2",
    components: {
        Preloader,
        ChatPopup,
        SidebarWidget,
        HeaderTwoPage,
        MainSliderTwo,
        FeatureTwo,
        AboutTwo,
        CounterOne,
        ProjectTwo,
        ServicesTwo,
        TeamOne,
        TestimonialTwo,
        ContactOne,
        BlogTwo,
        Footer1,
        MobileNav,
        SearchPopup,
        ScrollToTop
    },
    mounted() {
        if (typeof WOW !== 'undefined') {
            this._wow = new WOW();
            this._wow.init();
        } else if (typeof window.WOW === 'function') {
            this._wow = new window.WOW();
            this._wow.init();
        }
    },
    beforeUnmount() {
        if (this._wow && typeof this._wow.stop === 'function') {
            this._wow.stop();
        }
    }
};
</script>
