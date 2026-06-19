<template>
    <section class="service-style4">
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">service we provide</h2>
            </div>

            <!-- Carousel Section -->
            <div class="sf4-carousel-wrapper">
                <div class="sf4-track-outer">
                    <div class="sf4-track" :style="trackStyle" @transitionend="handleTransitionEnd">

                        <div v-for="(service, index) in extendedServices" :key="index" class="sf4-item content-slide">
                            <div class="single-service-style4">
                                <div class="img-box">
                                    <img :src="service.image" alt="Image">
                                    <div class="overlay-icon">
                                        <router-link to="/services"><i class="fa fa-link"></i></router-link>
                                    </div>
                                </div>

                                <div class="content-box">
                                    <h3>
                                        <router-link to="/services">
                                            {{ service.title }}
                                        </router-link>
                                    </h3>
                                    <p>{{ service.text }}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Navigation -->
                <div class="sf4-nav-row">
                    <button class="sf4-custom-btn sf4-btn-prev" @click="prev">
                        <span class="icon-left-arrow"></span>
                    </button>

                    <button class="sf4-custom-btn sf4-btn-next" @click="next">
                        <span class="icon-right-arrow"></span>
                    </button>
                </div>

            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import s1 from '@/assets/images/services/services-4-1.jpg'
import s2 from '@/assets/images/services/services-4-2.jpg'
import s3 from '@/assets/images/services/services-4-3.jpg'

const services = [
    { title: 'Commercial Design', text: 'The best projects and products in the commercial...', image: s1 },
    { title: 'Evolve Space Designs', text: 'A corporate business entity is an oit organization...', image: s2 },
    { title: 'Ee Modify Whole System', text: 'Our associate consultants specialize of business...', image: s3 },
]

const extendedServices = [
    ...services,
    ...services,
    ...services,
    ...services,
    ...services
]

const itemsPerView = ref(3)
const enableTransition = ref(true)
const currentIndex = ref(services.length * 2)
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
        currentIndex.value >= services.length * 3 ||
        currentIndex.value <= services.length
    ) {
        enableTransition.value = false
        const offset = ((currentIndex.value % services.length) + services.length) % services.length
        currentIndex.value = offset + services.length * 2
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

})

onUnmounted(() => {

    window.removeEventListener('resize', updateItemsPerView)

    stopAutoplay()

})
</script>
<style scoped>
.service-style4 {
    position: relative;
    padding: 120px 0;
}

.sf4-carousel-wrapper {
    position: relative;
    width: 100%;
}

.sf4-track-outer {
    overflow: hidden;
    width: 100%;
}

.sf4-item {
    flex: 0 0 calc(100% / 3);
    max-width: calc(100% / 3);
    padding: 0 15px;
    box-sizing: border-box;
}

@media (max-width: 1199px) {
    .sf4-item {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (max-width: 767px) {
    .sf4-item {
        flex: 0 0 100%;
        max-width: 100%;
    }
}

.sf4-nav-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 53px;
    width: 100%;
}

.sf4-custom-btn {
    height: 60px !important;
    width: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0;
    border-radius: 0 !important;
    border: none !important;
    background-color: var(--tecture-base) !important;
    color: var(--tecture-white) !important;
    font-size: 22px !important;
    cursor: pointer;
    transition: all 500ms ease;
    margin: 0 5px !important;
    padding: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
    clip-path: none !important;
    -webkit-clip-path: none !important;
    outline: none !important;
    z-index: 10;
}

.sf4-custom-btn::before,
.sf4-custom-btn::after {
    display: none !important;
    content: none !important;
}

.sf4-custom-btn:hover {
    background-color: var(--tecture-white) !important;
    color: var(--tecture-base) !important;
}

.sf4-custom-btn span {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transform: none !important;
    -webkit-transform: none !important;
}
</style>