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
        title="Services"
        subtitle="Business Models you can Consider"
      />

      <ServicesPageList />

      <SlidingTextOne />

      <AwardsOne />

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
import ServicesPageList from '@/components/services/ServicesPageList.vue';
import SlidingTextOne from '@/components/home-one/SlidingTextOne.vue';
import AwardsOne from '@/components/services/AwardsOne.vue';
import BrandOne from '@/components/home-one/BrandOne.vue';
</script>
