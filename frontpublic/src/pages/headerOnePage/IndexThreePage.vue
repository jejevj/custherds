<template>
    <div>
        <Preloader v-if="loading" />
         <ChatPopup />
        
        <div class="theme-border-left"></div>
        <div class="theme-border-right"></div>

        <SidebarWidget />

        <HeaderThreePage />
        <MainSliderThree id="home" />
        <AboutThree id="about" />
        <HowItWork />
        <ServicesThree id="services" />
        <SlidingTextTwo />
        <ProjectsThree id="projects" />
        <BeforeAndAfter />
        <TestimonialOne id="testimonials" />
        <TeamOne id="team" />
        <BlogThree id="blog" />
        <FooterThree />

        <MobileNav />
        <SearchPopup />
        <ScrollToTop />
    </div>
</template>

<script>
import Preloader from "@/components/common/Preloader.vue";
import HeaderThreePage from "@/components/layout/header/HeaderThreePage.vue";
import MainSliderThree from "@/components/home-three/MainSliderThree.vue";
import AboutThree from "@/components/home-three/AboutThree.vue";
import HowItWork from "@/components/home-three/HowItWork.vue";
import ServicesThree from "@/components/home-three/ServicesThree.vue";
import SlidingTextTwo from "@/components/home-three/SlidingTextTwo.vue";
import ProjectsThree from "@/components/home-three/ProjectsThree.vue";
import BeforeAndAfter from "@/components/home-three/BeforeAndAfter.vue";
import TestimonialOne from "@/components/home-one/TestimonialOne.vue";
import TeamOne from "@/components/home-two/TeamOne.vue";
import BlogThree from "@/components/home-three/BlogThree.vue";
import FooterThree from "@/components/layout/footer/FooterThree.vue";
import ChatPopup from "@/components/common/ChatPopup.vue";
import SidebarWidget from "@/components/common/SidebarWidget.vue";
import MobileNav from "@/components/common/MobileNav.vue";
import SearchPopup from "@/components/common/SearchPopup.vue";
import ScrollToTop from "@/components/common/ScrollToTop.vue";

export default {
    name: "Index3",
    components: {
        Preloader,
        HeaderThreePage,
        MainSliderThree,
        AboutThree,
        HowItWork,
        ServicesThree,
        SlidingTextTwo,
        ProjectsThree,
        BeforeAndAfter,
        TestimonialOne,
        TeamOne,
        BlogThree,
        FooterThree,
        ChatPopup,
        SidebarWidget,
        MobileNav,
        SearchPopup,
        ScrollToTop
    },
    data() {
        return {
            loading: true
        };
    },
    mounted() {
        this.loading = false;
        
        // Retrieve slider images for MainSliderThree if they were passed via props or just let component handle it
        // The component handles its own images.

        // Initialize WOW.js
        this.$nextTick(() => {
            if (typeof WOW === 'function') {
                this._wow = new WOW();
                this._wow.init();
            } else if (window.WOW) {
                this._wow = new window.WOW();
                this._wow.init();
            }
        });
    },
    beforeUnmount() {
        if (this._wow && typeof this._wow.stop === 'function') {
            this._wow.stop();
        }
    }
};
</script>
