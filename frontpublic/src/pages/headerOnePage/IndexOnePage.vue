<template>
  <div>
    <Preloader />
    <ChatPopup />

    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>

    <div class="page-wrapper">
      <HeaderOnePage />
      <MainSlider id="home" />
      <FeatureOne />
      <AboutOne id="about" />
      <SlidingTextOne />
      <ServicesOne id="services" />
      <ProjectsOne id="projects" />
      <DesignInterior />
      <TestimonialOne id="testimonial" />
      <VideoOne id="video" />
      <AwardsOne />
      <BlogOne id="blog" />
      <BrandOne />
      <Footer1 id="contact" />
    </div>

    <MobileNav />
    <SearchPopup />
    <ScrollToTop />
  </div>
</template>

<script>
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderOnePage from '@/components/layout/header/HeaderOnePage.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';
import MainSlider from '@/components/home-one/MainSlider.vue';
import FeatureOne from '@/components/home-one/FeatureOne.vue';
import AboutOne from '@/components/home-one/AboutOne.vue';
import SlidingTextOne from '@/components/home-one/SlidingTextOne.vue';
import ServicesOne from '@/components/home-one/ServicesOne.vue';
import ProjectsOne from '@/components/home-one/ProjectsOne.vue';
import DesignInterior from '@/components/home-one/DesignInterior.vue';
import TestimonialOne from '@/components/home-one/TestimonialOne.vue';
import VideoOne from '@/components/home-one/VideoOne.vue';
import AwardsOne from '@/components/home-one/AwardsOne.vue';
import BlogOne from '@/components/home-one/BlogOne.vue';
import BrandOne from '@/components/home-one/BrandOne.vue';

export default {
  name: "Index_1",
  components: {
    Preloader,
    ChatPopup,
    MobileNav,
    SearchPopup,
    ScrollToTop,
    HeaderOnePage,
    Footer1,
    MainSlider,
    FeatureOne,
    AboutOne,
    SlidingTextOne,
    ServicesOne,
    ProjectsOne,
    DesignInterior,
    TestimonialOne,
    VideoOne,
    AwardsOne,
    BlogOne,
    BrandOne
  }
}
</script>