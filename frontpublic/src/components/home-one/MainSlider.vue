<template>
    <div>
        <section class="main-slider">
            <!-- Slides -->
            <div class="main-slider__carousel" ref="carousel">
                <div
                    v-for="(slide, index) in slides"
                    :key="index"
                    class="item"
                    :class="{ active: currentIndex === index }"
                >
                    <div
                        class="main-slider__bg"
                        :style="{ backgroundImage: 'url(' + slide.bgImage + ')' }"
                    ></div>
                    <div class="main-slider__shape-1"></div>
                    <div class="main-slider__shape-2"></div>
                    <div class="main-slider__shape-3"></div>
                    <div class="main-slider__shape-4"></div>

                    <div class="container">
                        <div class="main-slider__content">
                            <div class="main-slider__video-link">
                                <a href="#" @click.prevent="openVideo(slide.videoLink)">
                                    <div class="main-slider__video-icon">
                                        <span class="fa fa-play"></span>
                                        <i class="ripple"></i>
                                    </div>
                                </a>
                            </div>
                            <h2 class="main-slider__title" v-html="slide.title"></h2>
                            <div class="main-slider__btn-box">
                                <router-link to="/about" class="thm-btn main-slider__btn">
                                    {{ slide.btnText }} <span class="icon-up-right-arrow"></span>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prev / Next Nav -->
            <div class="main-slider__nav">
                <button class="main-slider__prev" @click="prev" aria-label="Previous Slide">
                    <span class="icon-left-arrow"></span>
                </button>
                <button class="main-slider__next" @click="next" aria-label="Next Slide">
                    <span class="icon-right-arrow"></span>
                </button>
            </div>

            <!-- Dots -->
            <div class="main-slider__dots">
                <button
                    v-for="(slide, index) in slides"
                    :key="'dot-' + index"
                    class="main-slider__dot"
                    :class="{ active: currentIndex === index }"
                    @click="goTo(index)"
                    :aria-label="'Go to slide ' + (index + 1)"
                ></button>
            </div>
        </section>

        <VideoPopup v-model="isVideoOpen" :videoUrl="activeVideo" />
    </div>
</template>

<script>
import bg1 from '@/assets/images/backgrounds/slider-1-1.jpg';
import bg2 from '@/assets/images/backgrounds/slider-1-2.jpg';
import bg3 from '@/assets/images/backgrounds/slider-1-3.jpg';
import VideoPopup from '@/components/common/VideoPopup.vue';

export default {
    name: "MainSlider",
    components: { VideoPopup },

    data() {
        return {
            currentIndex: 0,
            autoplayTimer: null,
            autoplayDelay: 7000,
            activeVideo: "",
            isVideoOpen: false,
            slides: [
                {
                    bgImage: bg1,
                    videoLink: "https://www.youtube.com/watch?v=OzUkvzyBttA",
                    title: "Dedicated Team <br> Exceptional unique <br> architecture Design Idea",
                    btnText: "More Details"
                },
                {
                    bgImage: bg2,
                    videoLink: "https://www.youtube.com/watch?v=OzUkvzyBttA",
                    title: "Dedicated Team <br> Exceptional unique <br> architecture Design Idea",
                    btnText: "More Details"
                },
                {
                    bgImage: bg3,
                    videoLink: "https://www.youtube.com/watch?v=OzUkvzyBttA",
                    title: "Dedicated Team <br> Exceptional unique <br> architecture Design Idea",
                    btnText: "More Details"
                }
            ]
        };
    },

    methods: {
        goTo(index) {
            this.currentIndex = (index + this.slides.length) % this.slides.length;
            this.resetAutoplay();
        },
        next() {
            this.goTo(this.currentIndex + 1);
        },
        prev() {
            this.goTo(this.currentIndex - 1);
        },
        openVideo(url) {
            this.activeVideo = url;
            this.isVideoOpen = true;
        },
        startAutoplay() {
            this.autoplayTimer = setInterval(() => {
                this.goTo(this.currentIndex + 1);
            }, this.autoplayDelay);
        },
        resetAutoplay() {
            clearInterval(this.autoplayTimer);
            this.startAutoplay();
        }
    },

    mounted() {
        this.startAutoplay();
    },

    beforeUnmount() {
        clearInterval(this.autoplayTimer);
    }
};
</script>
