<template>
    <section class="testimonial-three">
        <!-- Parallax Background matching HTML -->
        <div class="testimonial-three__bg jarallax" :style="{ backgroundImage: 'url(' + bg + ')' }" data-jarallax
            data-speed="0.3" data-imgPosition="100% 100%">
        </div>

        <div class="container">
            <!-- Section Title matching HTML structure -->
            <div class="section-title sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Hear From Our Members</h2>
            </div>

            <!-- Carousel Section -->
            <div class="testimonial-three__carousel-container">
                <!-- Navigation — matches .owl-nav styling but using custom classes to avoid conflicts -->
                <div class="tt3-nav">
                    <button class="tt3-nav-btn tt3-btn-prev" @click="prev" aria-label="Previous">
                        <span class="icon-left-arrow"></span>
                    </button>
                    <button class="tt3-nav-btn tt3-btn-next" @click="next" aria-label="Next">
                        <span class="icon-right-arrow"></span>
                    </button>
                </div>

                <!-- Custom Sliding Track -->
                <div class="tt3-track-outer">
                    <div class="tt3-track" :style="trackStyle" @transitionend="handleTransitionEnd">
                        <div v-for="(item, index) in extendedTestimonials" :key="index" class="tt3-item slide-item">
                            <div class="single-testimonial-three">
                                <div class="img-box">
                                    <img :src="item.image" alt="Image">
                                </div>
                                <div class="single-testimonial-three-inner">
                                    <div class="content-box">
                                        <ul class="rating-box clearfix">
                                            <li v-for="n in 5" :key="n">
                                                <div class="icon">
                                                    <span class="icon-pointed-star"></span>
                                                </div>
                                            </li>
                                        </ul>
                                        <div class="text">
                                            <p>{{ item.text }}</p>
                                        </div>
                                        <div class="bottom-box">
                                            <div class="client-name">
                                                <h5>{{ item.name }}</h5>
                                                <p>{{ item.role }}</p>
                                            </div>
                                            <div class="quote-box">
                                                <i class="fa fa-quote-right"></i>
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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

import testimonialBg from '@/assets/images/testimonial/testimonial-3__bg.jpg';
import t1 from '@/assets/images/testimonial/testimonial-2-1.jpg';
import t2 from '@/assets/images/testimonial/testimonial-2-2.jpg';
import t3 from '@/assets/images/testimonial/testimonial-2-3.jpg';

const bg = testimonialBg;

const testimonials = [
    { name: 'Madriya Merin', role: 'Interrio Assistant', text: "Arrangements are made to transport cargo by sea to meet customers' international transportation needs.", image: t1 },
    { name: 'Mike Hardson', role: 'Spatial Design', text: "Arrangements are made to transport cargo by sea to meet customers' international transportation needs.", image: t2 },
    { name: 'Marco Jansen', role: 'Web Design', text: "Arrangements are made to transport cargo by sea to meet customers' international transportation needs.", image: t3 },
]

/* Duplicate slides for infinite effect */
const extendedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials
]

const itemsPerView = ref(3)
const enableTransition = ref(true)
const currentIndex = ref(testimonials.length * 2)
const autoplayInterval = ref(null)

const trackStyle = computed(() => {

    const percentage = 100 / itemsPerView.value

    return {
        display: 'flex',
        transform: `translateX(-${currentIndex.value * percentage}%)`,
        transition: enableTransition.value ? 'transform 500ms ease' : 'none',
        willChange: 'transform'
    }

})

const updateItemsPerView = () => {

    const w = window.innerWidth

    if (w < 768) itemsPerView.value = 1
    else if (w < 1200) itemsPerView.value = 2
    else itemsPerView.value = 3

}

const next = () => {

    enableTransition.value = true
    currentIndex.value++

    restartAutoplay()

}

const prev = () => {

    enableTransition.value = true
    currentIndex.value--

    restartAutoplay()

}

const handleTransitionEnd = () => {

    if (
        currentIndex.value >= testimonials.length * 3 ||
        currentIndex.value <= testimonials.length
    ) {

        enableTransition.value = false

        const offset =
            ((currentIndex.value % testimonials.length) + testimonials.length) % testimonials.length

        currentIndex.value = offset + testimonials.length * 2

    }

}

const startAutoplay = () => {

    autoplayInterval.value = setInterval(() => {

        next()

    }, 5000)

}

const stopAutoplay = () => {

    if (autoplayInterval.value) clearInterval(autoplayInterval.value)

}

const restartAutoplay = () => {

    stopAutoplay()
    startAutoplay()

}

onMounted(() => {

    updateItemsPerView()

    window.addEventListener('resize', updateItemsPerView)

    startAutoplay()

    /* Jarallax */
    if (window.jarallax) {
        window.jarallax(document.querySelectorAll('.jarallax'), { speed: 0.3 })
    }

})

onUnmounted(() => {

    window.removeEventListener('resize', updateItemsPerView)

    stopAutoplay()

})
</script>

<style scoped>
.testimonial-three {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 120px 0px 120px;
}

.testimonial-three__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    mix-blend-mode: luminosity;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: scroll;
    background-position: center center;
    z-index: -1;
}

.testimonial-three__bg::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.97;
    background-color: var(--tecture-black);
}

.testimonial-three__carousel-container {
    position: relative;
    display: block;
    margin-top: 50px;
    /* Space between title and carousel */
}

/* 
   Navigation buttons sitting top-right of the carousel container.
   This matches the design intent and avoids squashing the title.
*/
.tt3-nav {
    position: absolute;
    top: -122px;
    right: 0;
    display: flex;
    z-index: 100;
}

@media (max-width: 767px) {
    .tt3-nav {
        position: relative;
        top: 0;
        justify-content: center;
        margin-bottom: 20px;
        margin-top: -30px;
    }
}

.tt3-nav-btn {
    height: 60px !important;
    width: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 0 !important;
    border: none !important;
    background-color: var(--tecture-base) !important;
    color: var(--tecture-white) !important;
    font-size: 22px !important;
    cursor: pointer;
    transition: all 500ms ease;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
    clip-path: none !important;
    -webkit-clip-path: none !important;
    outline: none !important;
}

/* Kill global diamond rules from style.css */
.tt3-nav-btn::before,
.tt3-nav-btn::after {
    display: none !important;
    content: none !important;
}

.tt3-btn-prev {
    margin-right: 10px !important;
}

.tt3-nav-btn:hover {
    background-color: var(--tecture-white) !important;
    color: var(--tecture-base) !important;
}

.tt3-nav-btn span {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

/* Sliding Track Styles */
.tt3-track-outer {
    overflow: hidden;
    width: 100%;
}

.tt3-item {
    flex: 0 0 calc(100% / 3);
    max-width: calc(100% / 3);
    padding: 0 15px;
    box-sizing: border-box;
}

@media (max-width: 1199px) {
    .tt3-item {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (max-width: 767px) {
    .tt3-item {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
</style>
