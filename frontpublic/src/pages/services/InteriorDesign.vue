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
        title="Interior Design"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <!-- Services Details Start -->
      <section class="service-details">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
          <div class="row">
            <div class="col-xl-4 col-lg-5">
              <ServiceDetailsSidebar activeService="interior-design" />
            </div>
            <div class="col-xl-8 col-lg-7">
              <ServiceDetailsContent 
                :title="serviceData.title"
                :mainImage="serviceData.mainImage"
                :pointsImage="serviceData.pointsImage"
                :description="serviceData.description"
                :description2="serviceData.description2"
                :pointsTitle="serviceData.pointsTitle"
                :points="serviceData.points"
                :strengthsTitle="serviceData.strengthsTitle"
                :strengthsText="serviceData.strengthsText"
              />
            </div>
          </div>
        </div>
      </section>
      <!-- Services Details End -->

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
import ServiceDetailsSidebar from '@/components/services/ServiceDetailsSidebar.vue';
import ServiceDetailsContent from '@/components/services/ServiceDetailsContent.vue';
import BrandOne from '@/components/home-one/BrandOne.vue';

import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import mainImage from '@/assets/images/services/service-details-img-4.jpg';
import pointsImage from '@/assets/images/services/service-details-points-img.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Services', link: '/services' },
    { label: 'Interior Design', link: '' }
];

const serviceData = {
    title: 'Interior Design',
    mainImage: mainImage,
    pointsImage: pointsImage,
    description: 'Globally optimize highly efficient solution whereas open-source application. Completely strategize quality internal or "organic" sources for virtual e-business. Phosfluorescently re-engineer enterprise markets via value-added networks. Seamlessly restore inexpensive e-markets vis-a-vis corporate intellectual capital. Holisticly reinvent compelling niche markets via scalable strategic.',
    description2: 'Globally optimize highly efficient solution whereas open-source application. Completely strategize quality internal or "organic" sources for virtual e-business. Phosfluorescently re-engineer enterprise markets via value-added networks. Seamlessly restore inexpensive e-markets vis-a-vis corporate intellectual',
    pointsTitle: 'Global QuantumTech AI',
    points: [
        'Customer engagement matters',
        'The Love Boat promis someg for Plan',
        'Research beyond the business plan',
        'Id risus pharetra est, at rhoncus, nec',
        'Elit curabitur amet risus bibendum.',
        'Non saed velit dictum quam risus pharetra esta.'
    ],
    strengthsTitle: 'Our Strengths And Advantages',
    strengthsText: 'Globally optimize highly efficient solution whereas open-source application. Completely strategize quality internal or "organic" sources for virtual e-business. Phosfluorescently re-engineer enterprise markets via value-added networks. Seamlessly restore inexpensive e-markets vis-a-vis corporate intellectual capital. Holisticly reinvent compelling niche'
};
</script>
