<template>
    <section class="projects-three">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="projects-three__wrapper">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">We Elevate Your Brand's <br> Daring Dedication.</h2>
            </div>
            
            <div class="projects-three__swiper-container swiper-container" id="projects-three__carousel" @click="handleCarouselClick">
                <div class="swiper-wrapper">
                    <div class="swiper-slide" v-for="(project, index) in projects" :key="index" :data-swiper-slide-index="index">
                        <div class="item">
                            <div class="projects-three__single">
                                <div class="projects-three__img">
                                    <img :src="project.image" alt="">
                                    <div class="projects-three__content">
                                        <p class="projects-three__sub-title">{{ project.subtitle }}</p>
                                        <h4 class="projects-three__title">
                                            <router-link to="/project-details">{{ project.title }}</router-link>
                                        </h4>
                                    </div>
                                    <div class="projects-three__arrow">
                                        <a :href="project.image" class="img-popup">
                                            <span class="icon-up-right-arrow-1"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="owl-nav">
                    <button type="button" role="presentation" class="owl-prev" id="projects-three__swiper-prev">
                        <span class="icon-left-arrow"></span>
                    </button>
                    <button type="button" role="presentation" class="owl-next" id="projects-three__swiper-next">
                        <span class="icon-right-arrow"></span>
                    </button>
                </div>
            </div>
            
            <ImagePopup v-model="isPopupOpen" v-model:initialIndex="popupIndex" :images="projects" />
        </div>
    </section>
</template>

<script>
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import p1 from '@/assets/images/project/projects-3-1.jpg';
import p2 from '@/assets/images/project/projects-3-2.jpg';
import p3 from '@/assets/images/project/projects-3-3.jpg';
import p4 from '@/assets/images/project/projects-3-4.jpg';
import ImagePopup from '@/components/common/ImagePopup.vue';

export default {
    name: "ProjectsThree",
    components: {
        ImagePopup
    },
    data() {
        return {
            sectionShape,
            projects: [
                { title: "Neoclassical Sofa",       subtitle: "Interior Design", image: p1 },
                { title: "Living Room Interior Design",    subtitle: "Interior Design", image: p2 },
                { title: "Living Room Remodeling",  subtitle: "Building",        image: p3 },
                { title: "Restaurant Interior Design",     subtitle: "Architecture",    image: p4 },
                { title: "Neoclassical Sofa",       subtitle: "Interior Design", image: p1 },
                { title: "Living Room Interior Design",    subtitle: "Interior Design", image: p2 },
                { title: "Living Room Remodeling",  subtitle: "Building",        image: p3 },
                { title: "Restaurant Interior Design",     subtitle: "Architecture",    image: p4 }
            ],
            isPopupOpen: false,
            popupIndex: 0,
            swiperInstance: null
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.initSwiper();
        });
    },
    beforeUnmount() {
        if (this.swiperInstance) {
            this.swiperInstance.destroy(true, true);
        }
    },
    methods: {
        initSwiper() {
            this.swiperInstance = new Swiper("#projects-three__carousel", {
                loop: true,
                speed: 500,
                autoplay: {
                    delay: 7000
                },
                spaceBetween: 0,
                navigation: {
                    prevEl: '#projects-three__swiper-prev',
                    nextEl: '#projects-three__swiper-next'
                },
                breakpoints: {
                    0: { slidesPerView: 1, spaceBetween: 0 },
                    768: { slidesPerView: 2, spaceBetween: 0 },
                    992: { slidesPerView: 3, spaceBetween: 0 },
                    1200: { slidesPerView: 4, spaceBetween: 0 }
                }
            });
        },
        handleCarouselClick(event) {
            const popupLink = event.target.closest('.img-popup');
            if (popupLink) {
                event.preventDefault();
                event.stopPropagation();
                // Find the index by looking at the parent slide's data-swiper-slide-index
                const slide = popupLink.closest('.swiper-slide');
                if (slide) {
                    const realIndex = parseInt(slide.getAttribute('data-swiper-slide-index'));
                    if (!isNaN(realIndex)) {
                        this.openPopup(realIndex);
                    }
                }
            }
        },
        openPopup(index) {
            this.popupIndex = index;
            this.isPopupOpen = true;
        }
    }
};
</script>

<style>
/* Force visibility and fix overlapping/shape issues caused by conflicting template CSS */
.projects-three__swiper-container.swiper-container {
    opacity: 1 !important;
    visibility: visible !important;
    height: auto !important;
    position: relative !important;
    transform: none !important;
    top: auto !important;
    margin-top: 60px;
    overflow: hidden;
    display: block;
}

/* Ensure slides don't inherit diamond shape and remove all gaps/shifts */
.projects-three__swiper-container .swiper-slide {
    clip-path: none !important;
    -webkit-clip-path: none !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
}

.projects-three__swiper-container .swiper-wrapper {
    display: flex;
    padding-left: 0 !important;
    margin-left: 0 !important;
}

/* Navigation Buttons Positioned on Image Left/Right - Only show on Hover */
.projects-three__swiper-container .owl-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 10;
    padding: 0 40px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.5s ease;
}

.projects-three__swiper-container:hover .owl-nav {
    opacity: 1;
    visibility: visible;
}

.projects-three__swiper-container .owl-nav button {
    pointer-events: auto;
    width: 80px;
    height: 80px;
    background-color: var(--tecture-base);
    color: var(--tecture-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border: none;
    cursor: pointer;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    transition: all 0.3s ease;
}

.projects-three__swiper-container .owl-nav button:hover {
    background-color: var(--black, #ffffffff);
    color: var(--tecture-base);
}

.projects-three .item {
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
}

.projects-three__single {
    margin: 0 !important;
}
</style>
