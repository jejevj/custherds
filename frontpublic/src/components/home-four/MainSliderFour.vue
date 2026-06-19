<template>
    <section class="main-slider-four">
        <div class="main-slider-four__carousel" ref="carousel">
            <div
                v-for="(slide, index) in slides"
                :key="index"
                class="item"
                :class="{ active: currentIndex === index }"
            >
                <div class="main-slider__bg" :style="{ backgroundImage: 'url(' + slide.bg + ')' }"></div>
                <div class="container">
                    <div class="main-slider-four__content">
                        <div class="title">
                            <h2 v-html="slide.title"></h2>
                        </div>
                        <div class="text">
                            <p>{{ slide.text }}</p>
                        </div>
                        <div class="btn-box">
                            <router-link to="/about" class="thm-btn">More Details <span class="icon-up-right-arrow"></span></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </section>
</template>

<script>
import sliderBg from '@/assets/images/backgrounds/slider-1-1.jpg';

export default {
    name: "MainSliderFour",
    data() {
        return {
            slides: [
                {
                    bg: sliderBg,
                    title: 'We Won Best<br>Designer <span>Awards</span>',
                    text: 'Praising pain was born and we will give you a complete account of the system and expound teachings. Some great pleasure. To take a trivial example, which of us ever undertakes.'
                },
                {
                    bg: sliderBg,
                    title: 'We Won Best<br>Designer <span>Awards</span>',
                    text: 'Praising pain was born and we will give you a complete account of the system and expound teachings. Some great pleasure. To take a trivial example, which of us ever undertakes.'
                },
                {
                    bg: sliderBg,
                    title: 'We Won Best<br>Designer <span>Awards</span>',
                    text: 'Praising pain was born and we will give you a complete account of the system and expound teachings. Some great pleasure. To take a trivial example, which of us ever undertakes.'
                },
            ],
            currentIndex: 0,
            autoplayInterval: null,
        };
    },
    mounted() {
        this.startAutoplay();
    },
    beforeUnmount() {
        this.stopAutoplay();
    },
    methods: {
        goTo(index) {
            this.currentIndex = (index + this.slides.length) % this.slides.length;
        },
        startAutoplay() {
            this.autoplayInterval = setInterval(() => {
                this.goTo(this.currentIndex + 1);
            }, 6000);
        },
        stopAutoplay() {
            if (this.autoplayInterval) clearInterval(this.autoplayInterval);
        },
        restartAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }
};
</script>

<style scoped>
/* Carousel wrapper: stack slides absolutely */
.main-slider-four__carousel {
    position: relative;
    overflow: hidden;
}

/* Each slide stacks on top of each other */
.main-slider-four__carousel .item {
    position: absolute;
    top: 0; left: 0; width: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 700ms ease;
    z-index: 1;
}

.main-slider-four__carousel .item.active {
    position: relative;   /* active slide takes up actual height */
    opacity: 1;
    pointer-events: auto;
    z-index: 2;
}
</style>
