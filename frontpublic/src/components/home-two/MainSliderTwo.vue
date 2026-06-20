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
                            <router-link :to="slide.ctaLink" class="thm-btn main-slider-two__btn">{{ slide.ctaLabel }} <span class="icon-up-right-arrow"></span></router-link>
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
export default {
    name: "MainSliderTwo",
    data() {
        return {
            currentIndex: 0,
            autoplayTimer: null,
            slides: [
                {
                    bg: 'https://www.custherds.com/assets/images/slide/page1.webp?v=44806c3050915c018d83a707fe577223',
                    title: "Turn Your Network <br> into Net Worth",
                    text: "Connect Affiliate Partners & Businesses Vendors. Earn unlimited potential income, <br> be part of custherds community",
                    ctaLabel: "Affiliate Partner",
                    ctaLink: "/contact"
                },
                {
                    bg: 'https://www.custherds.com/assets/images/slide/page1-3.webp?v=44806c3050915c018d83a707fe577223',
                    title: "Turn Your Network <br> into Net Worth",
                    text: "Connect Affiliate Partners & Businesses Vendors. Earn unlimited potential income, <br> be part of custherds community",
                    ctaLabel: "Business Vendor",
                    ctaLink: "/contact"
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
.main-slider-two {
    position: relative;
    overflow: hidden;
}

.main-slider__carousel {
    position: relative;
    display: block;
    width: 100%;
    min-height: 800px;
}

@media (max-width: 767px) {
    .main-slider__carousel {
        min-height: 500px;
    }
}
</style>
