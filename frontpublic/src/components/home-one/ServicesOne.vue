<template>
    <section class="services-one">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">
                    Where Inovation Meet <br>Interior Design
                </h2>
            </div>
            <div class="row">
                <!-- Services One Single Start -->
                <div v-for="(service, index) in services" :key="index" class="col-xl-4 col-lg-4" :class="service.animationClass" :data-wow-delay="service.delay">
                    <div class="services-one__single">
                        <div class="services-one__shape-1"
                            style="background-image: url(@/assets/images/shapes/services-one-shape-1.png);"></div>
                        <div class="services-one__content-box">
                            <h3 class="services-one__title"><router-link :to="service.link">{{ service.title }}</router-link></h3>
                            <div class="services-one__img">
                                <img :src="service.image" alt="">
                            </div>
                            <p class="services-one__text">{{ service.text }}</p>
                        </div>
                        <router-link :to="service.link" class="services-one__btn custom-align">
                            <span class="icon-right-arrow"></span> More Details
                        </router-link>
                    </div>
                </div>
                <!-- Services One Single End -->
            </div>
        </div>
    </section>
</template>

<script>
import s1 from '@/assets/images/services/services-1-1.jpg';
import s2 from '@/assets/images/services/services-1-2.jpg';
import s3 from '@/assets/images/services/services-1-3.jpg';

export default {
    name: "ServicesOne",
    data() {
        return {
            services: [
                {
                    title: "Evolve Space Designs",
                    link: "/evolve-space-designs",
                    image: s1,
                    text: "A corporate business entity is an oit organization formed with the a mans a",
                    animationClass: "wow fadeInLeft",
                    delay: "100ms"
                },
                {
                    title: "Eden Home Styling",
                    link: "/eden-home-styling",
                    image: s2,
                    text: "A corporate business entity is an oit organization formed with the a mans a",
                    animationClass: "wow fadeInUp",
                    delay: "200ms"
                },
                {
                    title: "Harmony Interiors",
                    link: "/harmony-interiors",
                    image: s3,
                    text: "A corporate business entity is an oit organization formed with the a mans a",
                    animationClass: "wow fadeInRight",
                    delay: "300ms"
                }
            ]
        };
    }
};
</script>

<style scoped>
.services-one__btn.custom-align {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; /* Perfectly gaps the icon and text */
}

/* Override existing span styles to strip backgrounds/borders and vertically align */
.services-one__btn.custom-align span {
    padding-right: 0px !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    width: auto !important;
    height: auto !important;
    line-height: 1 !important;
    display: inline-flex;
    align-items: center;
}
</style>
