<template>
    <section class="main-slider-three">
        <ul class="list-unstyled main-slider-three__contact-list">
            <li>
                <div class="icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="text">
                    <p><a href="mailto:needhelp@company.com">needhelp@company.com</a></p>
                </div>
            </li>
            <li>
                <div class="icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="text">
                    <p><a href="tel:0012346823705">+00 (1234) 682 3705</a></p>
                </div>
            </li>
            <li>
                <div class="main-slider-three__social">
                    <a href="#"><span class="fab fa-facebook-f"></span></a>
                    <a href="#"><span class="fab fa-twitter"></span></a>
                    <a href="#"><span class="fab fa-vine"></span></a>
                    <a href="#"><span class="fab fa-instagram"></span></a>
                </div>
            </li>
        </ul>
        <div class="container-full">
            <div class="main-slider-three__slider">
                <div class="row">

                    <div class="col-xl-4 col-lg-4 col-md-5">
                        <div class="main-slider-three__left">
                            <div class="swiper-container" id="main-slider-three__thumb">
                                <div class="swiper-wrapper" :style="wrapperStyle">
                                    <div 
                                        class="swiper-slide" 
                                        v-for="(slide, index) in displaySlides" 
                                        :key="index"
                                        :class="{ 'swiper-slide-thumb-active': getRealIndex(index) === getRealIndex(activeIndex) }"
                                    >
                                        <div class="main-slider-three__content-one">
                                            <h2 class="main-slider-three__title-one">{{ slide.subtitle }}</h2>
                                            <h3 class="main-slider-three__title-two">{{ slide.title }}</h3>
                                            <p class="main-slider-three__price">{{ slide.price }}</p>
                                            <div class="main-slider-three__btn-box">
                                                <a href="contact.html" class="thm-btn main-slider-three__btn">
                                                    Get In Touch
                                                    <span class="icon-up-right-arrow"></span>
                                                </a>
                                            </div>
                                            <h3 class="main-slider-three__title-three">{{ slide.category }}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="main-slider-three__nav">
                                <div class="swiper-nav-button prev-btn" @click="prevSlide">
                                    <i class="icon-left-arrow"></i>
                                </div>
                                <div class="swiper-nav-button next-btn" @click="nextSlide">
                                    <i class="icon-right-arrow"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-8 col-lg-8 col-md-7">
                        <div class="main-slider-three__right">
                            <div class="main-slider-three__main-content">
                                <div class="swiper-container" id="main-slider-three__carousel">
                                    <div class="swiper-wrapper" :style="wrapperStyle">
                                        <div class="swiper-slide" v-for="(slide, index) in displaySlides" :key="index">
                                            <div class="main-slider-three__img-box">
                                                <div class="main-slider-three__img">
                                                    <img :src="slide.image" :alt="slide.title">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import sliderImg1 from '@/assets/images/resources/main-slider-three-1-1.jpg';
import sliderImg2 from '@/assets/images/resources/main-slider-three-1-2.jpg';
import sliderImg3 from '@/assets/images/resources/main-slider-three-1-3.jpg';

export default {
    name: "MainSliderThree",
    data() {
        return {
            slides: [
                {
                    subtitle: 'Interior',
                    title: 'Design Make Dream',
                    price: '$500',
                    category: 'Design',
                    image: sliderImg1
                },
                {
                    subtitle: 'Interior',
                    title: 'Living Room Design',
                    price: '$800',
                    category: 'Design',
                    image: sliderImg2
                },
                {
                    subtitle: 'Interior',
                    title: 'Stunning Interior Design',
                    price: '$500',
                    category: 'Design',
                    image: sliderImg3
                }
            ],
            activeIndex: 1, // Start at 1 because 0 is a clone
            isTransitioning: false,
            autoplayInterval: null
        };
    },
    computed: {
        displaySlides() {
            // Clones for infinite loop: [Last, Slide1, Slide2, Slide3, First]
            if (this.slides.length === 0) return [];
            return [
                this.slides[this.slides.length - 1],
                ...this.slides,
                this.slides[0]
            ];
        },
        wrapperStyle() {
            return {
                display: 'flex',
                transition: this.isTransitioning ? 'transform 1400ms ease' : 'none',
                transform: `translateX(-${(this.activeIndex * 100) / this.displaySlides.length}%)`,
                width: `${this.displaySlides.length * 100}%`
            };
        }
    },
    mounted() {
        this.startAutoplay();
    },
    beforeUnmount() {
        this.stopAutoplay();
    },
    methods: {
        nextSlide() {
            if (this.isTransitioning && this.activeIndex >= this.displaySlides.length - 1) return;
            this.isTransitioning = true;
            this.activeIndex++;
            this.checkBoundary();
        },
        prevSlide() {
            if (this.isTransitioning && this.activeIndex <= 0) return;
            this.isTransitioning = true;
            this.activeIndex--;
            this.checkBoundary();
        },
        checkBoundary() {
            // Wait for transition to finish
            setTimeout(() => {
                if (this.activeIndex >= this.displaySlides.length - 1) {
                    this.isTransitioning = false;
                    this.activeIndex = 1;
                } else if (this.activeIndex <= 0) {
                    this.isTransitioning = false;
                    this.activeIndex = this.displaySlides.length - 2;
                } else {
                    this.isTransitioning = false;
                }
            }, 1400); // Same as transition time
        },
        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => {
                this.nextSlide();
            }, 5000);
        },
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        },
        getRealIndex(index) {
            // Maps the display index back to the real slides index for active classes
            if (index === 0) return this.slides.length - 1;
            if (index === this.displaySlides.length - 1) return 0;
            return index - 1;
        }
    }
}
</script>

<style scoped>
.swiper-container {
    overflow: hidden;
    width: 100%;
}

.swiper-wrapper {
    display: flex;
    width: 100%;
}

.swiper-slide {
    flex: 0 0 calc(100% / v-bind('displaySlides.length'));
    width: calc(100% / v-bind('displaySlides.length'));
}

/* Nav Button Styling - Matching UI Image */
.main-slider-three__nav {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 50px;
    z-index: 100;
}

.swiper-nav-button {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    color: var(--tecture-gray);
    background-color: transparent;
    border: 2px solid var(--tecture-bdr-color);
    margin: 0;
    transition: all 500ms ease;
    cursor: pointer;
}

.prev-btn {
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.next-btn {
    border-top-right-radius: 25px;
    border-bottom-right-radius: 25px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.swiper-nav-button:hover {
    color: var(--tecture-white);
    background-color: var(--tecture-base);
    border: 2px solid var(--tecture-base);
}

.swiper-nav-button i {
    position: relative;
    display: flex;
    align-items: center;
    font-family: 'icomoon' !important;
}

/* Ensure images cover the full height/width correctly */
.main-slider-three__img img {
    width: 100%;
    display: block;
}

/* Base styles for slide text animations */
.main-slider-three__content-one > * {
    transition: all 1400ms ease;
}
</style>
