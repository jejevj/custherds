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
        title="Contact"
        subtitle=""
        :breadcrumbs="breadcrumbs"
      />

      <!-- Contact Page -->
      <section class="contact-page">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
          <div class="contact-page__inner">
            <div class="row">
              <div class="col-xl-5 col-lg-5">
                <ContactInformation :contactInfo="contactInfo" />
              </div>

              <div class="col-xl-7 col-lg-7">
                <ContactForm @submit="handleFormSubmit" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Info Cards -->
      <section class="contact-info-section">
        <div class="container">
          <div class="row">
            <div 
              v-for="(card, index) in infoCards" 
              :key="index" 
              class="col-xl-3"
            >
              <ContactInfoCard
                :icon="card.icon"
                :title="card.title"
                :subtitle="card.subtitle"
                :contact="card.contact"
                :link="card.link"
                :type="card.type"
                :buttonText="card.buttonText"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Google Map -->
      <GoogleMap :mapUrl="mapUrl" />

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
import ContactInformation from '@/components/contact/ContactInformation.vue';
import ContactForm from '@/components/contact/ContactForm.vue';
import ContactInfoCard from '@/components/contact/ContactInfoCard.vue';
import GoogleMap from '@/components/contact/GoogleMap.vue';

import sectionShape from '@/assets/images/shapes/section-shape-1.png';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Contact', link: '' }
];

const contactInfo = [
    {
        icon: 'icon-pin',
        title: 'Address',
        text: '7515 Carriage Court, CA, 92236 USA',
        type: 'text'
    },
    {
        icon: 'icon-trading',
        title: 'Contact Namber',
        text: '(+6656) 1598596969',
        value: '66561598596969',
        type: 'phone'
    },
    {
        icon: 'icon-envelope-1',
        title: 'Email Us',
        text: 'shifamoni6790@gmail.com',
        value: 'shifamoni6790@gmail.com',
        type: 'email'
    }
];

const infoCards = [
    {
        icon: 'icon-pin',
        title: 'Location',
        subtitle: 'Discover innovation doorstep.',
        contact: '14 Tottenham Road, United Kingdom',
        buttonText: 'View On Map',
        type: 'text'
    },
    {
        icon: 'icon-telephone',
        title: 'Telephone',
        subtitle: 'Your bridge to hassle-free service.',
        contact: '+1 212-226-3126',
        link: '12122263126',
        buttonText: 'Get Call Back',
        type: 'phone'
    },
    {
        icon: 'icon-envelope-2',
        title: 'Your Email',
        subtitle: 'Your bridge to hassle-free service.',
        contact: 'head@transcargo.com',
        link: 'head@transcargo.com',
        buttonText: 'Inter Email',
        type: 'email'
    },
    {
        icon: 'far fa-clock',
        title: 'Off.Hrs',
        subtitle: 'Monday-Satday: 9.00 am to 7.30 pm',
        contact: 'Hotline is available 24/7.',
        buttonText: 'Get Call Back',
        type: 'text'
    }
];

const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4562.753041141002!2d-118.80123790098536!3d34.152323469614075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80e82469c2162619%3A0xba03efb7998eef6d!2sCostco+Wholesale!5e0!3m2!1sbn!2sbd!4v1562518641290!5m2!1sbn!2sbd';

const handleFormSubmit = (formData) => {
    console.log('Contact form submitted:', formData);
    // Here you would typically send the data to your backend API
    alert('Thank you for contacting us! We will get back to you soon.');
};
</script>
