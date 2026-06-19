<template>
    <section class="main-slider-two">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="main-slider__carousel">
            
            <div 
                v-for="(slide, index) in slides" 
                :key="index"
                class="item"
                :class="{ active: currentIndex === index }"
            >
                <div class="main-slider-two__bg" :style="{ backgroundImage: 'url(' + slide.bg + ')' }"></div>
                <div class="container">
                    <div class="main-slider-two__content">
                        <h2 class="main-slider-two__title" v-html="slide.title"></h2>
                        <p class="main-slider-two__text" v-html="slide.text"></p>
                        <div class="main-slider-two__btn-box">
                            <router-link to="/about" class="thm-btn main-slider-two__btn">More Details <span class="icon-up-right-arrow"></span></router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <div class="main-slider-two__nav">
                <button class="main-slider-two__prev" @click="prev" aria-label="Previous"><span class="icon-left-arrow"></span></button>
                <button class="main-slider-two__next" @click="next" aria-label="Next"><span class="icon-right-arrow"></span></button>
            </div>
            
            <!-- Pagination -->
            <div class="main-slider-two__dots">
                <button 
                    v-for="(slide, index) in slides" 
                    :key="'dot-' + index"
                    class="main-slider-two__dot"
                    :class="{ active: currentIndex === index }"
                    @click="goTo(index)"
                    aria-label="Go to slide"
                ></button>
            </div>
            
        </div>
    </section>
</template>

<script>
import bg1 from '@/assets/images/backgrounds/slider-2-1.jpg';
import bg2 from '@/assets/images/backgrounds/slider-2-2.jpg';
import bg3 from '@/assets/images/backgrounds/slider-2-3.jpg';

export default {
    name: "MainSliderTwo",
    data() {
        return {
            currentIndex: 0,
            autoplayTimer: null,
            slides: [
                {
                    bg: bg1,
                    title: "Stunning Interior <br> Design Possibilities",
                    text: "Ut elementum sergeoi mollis eu sapien neque des tempus Tristique nisl nibh desing here this de tinci dunt our designer <br> here is Tristique nisl nibh desing here this de tinci Tristique nisl nibh desing here this de tinci"
                },
                {
                    bg: bg2,
                    title: "Stunning Interior <br> Design Possibilities",
                    text: "Ut elementum sergeoi mollis eu sapien neque des tempus Tristique nisl nibh desing here this de tinci dunt our designer <br> here is Tristique nisl nibh desing here this de tinci Tristique nisl nibh desing here this de tinci"
                },
                {
                    bg: bg3,
                    title: "Stunning Interior <br> Design Possibilities",
                    text: "Ut elementum sergeoi mollis eu sapien neque des tempus Tristique nisl nibh desing here this de tinci dunt our designer <br> here is Tristique nisl nibh desing here this de tinci Tristique nisl nibh desing here this de tinci"
                }
            ]
        };
    },
    mounted() {
        this.startAutoplay();
    },
    beforeUnmount() {
        clearInterval(this.autoplayTimer);
    },
    methods: {
        startAutoplay() {
            if (this.autoplayTimer) clearInterval(this.autoplayTimer);
            this.autoplayTimer = setInterval(() => {
                this.next();
            }, 7000);
        },
        next() {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            this.startAutoplay();
        },
        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
            this.startAutoplay();
        },
        goTo(index) {
            this.currentIndex = index;
            this.startAutoplay();
        }
    }
};
</script>

<style scoped>
/* Create bounds to contain the absolutely positioned fading slides */
.main-slider-two {
    position: relative;
    overflow: hidden;
}

.main-slider__carousel {
    position: relative;
    display: block;
    width: 100%;
    /* Keep a minimum height to avoid zero-height collapsing from absolute children.
       Calculated heavily from slider.css padding requirements. */
    min-height: 800px;
}

@media (max-width: 767px) {
    .main-slider__carousel {
        min-height: 500px;
    }
}
</style>
