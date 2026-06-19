<template>
    <section class="services-four">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">Elevate Your Spac Transform Your <br>
                    Home With Expert Design</h2>
            </div>
            <div class="row">
                <!--Services Four Single Start-->
                <div v-for="(service, index) in services" :key="index" 
                     class="col-xl-4 col-lg-4 wow fadeInLeft" :data-wow-delay="service.delay">
                    <div class="services-four__single">
                        <div class="services-four__icon-box">
                            <div class="services-four__icon">
                                <span :class="service.icon"></span>
                            </div>
                        </div>
                        <div class="services-four__content">
                            <h4 class="services-four__title">
                                <router-link to="/services">{{ service.title }}</router-link>
                            </h4>
                            <p class="services-four__text">{{ service.text }}</p>
                        </div>
                        <div class="services-four__arrow">
                            <router-link to="/services"><span class="icon-right-arrow"></span></router-link>
                        </div>
                    </div>
                </div>
                <!--Services Four Single End-->
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

const services = [
    {
        icon: 'icon-passport',
        title: 'Reasonable Prices',
        text: 'As well as getting to fly to different dest as part of their job, airplane pilots get big',
        delay: '100ms'
    },
    {
        icon: 'icon-workstations',
        title: 'Reasonable Services',
        text: 'As well as getting to fly to different dest as part of their job, airplane pilots get big',
        delay: '200ms'
    },
    {
        icon: 'icon-engineer',
        title: '360 PANORAMA & 3D VIRTUAL',
        text: 'As well as getting to fly to different dest as part of their job, airplane pilots get big',
        delay: '300ms'
    }
];
</script>
