<template>
    <div>
        <Preloader />
        <ChatPopup />

        <div class="theme-border-left"></div>
        <div class="theme-border-right"></div>

        <SidebarWidget />

        <div class="page-wrapper">
            <HeaderTwo />

            <MainSliderTwo />
            <FeatureTwo />
            <SlidingTextOne />
            <AboutTwo />
            <ServicesTwo />
            <CounterOne />
            <ContactOne />

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
import HeaderTwo from "@/components/layout/header/HeaderTwo.vue";
import MainSliderTwo from "@/components/home-two/MainSliderTwo.vue";
import FeatureTwo from "@/components/home-two/FeatureTwo.vue";
import SlidingTextOne from "@/components/home-one/SlidingTextOne.vue";
import AboutTwo from "@/components/home-two/AboutTwo.vue";
import ServicesTwo from "@/components/home-two/ServicesTwo.vue";
import CounterOne from "@/components/home-two/CounterOne.vue";
import ContactOne from "@/components/home-two/ContactOne.vue";
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
        HeaderTwo,
        MainSliderTwo,
        FeatureTwo,
        SlidingTextOne,
        AboutTwo,
        ServicesTwo,
        CounterOne,
        ContactOne,
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
