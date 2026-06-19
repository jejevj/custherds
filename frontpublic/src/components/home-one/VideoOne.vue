<template>
    <section class="video-one">
        <div class="video-one__inner">

            <!-- Curved Circle + Video Play Button -->
            <div class="video-one__curved-circle">
                <!-- Native SVG Circular Text (Perfectly centered, proper kerning) -->
                <svg class="video-one__svg-circle" viewBox="0 0 128 128">
                    <path id="curve" fill="none" d="M 64, 128 a 64,64 0 1,1 0,-128 a 64,64 0 1,1 0,128" />
                    <text class="video-one__svg-text">
                        <textPath href="#curve" startOffset="50%" text-anchor="middle">
                            Cool Branding And Development and 
                        </textPath>
                    </text>
                </svg>
                <div class="video-one__video-link">
                    <a href="#" @click.prevent="openVideo('https://www.youtube.com/watch?v=OzUkvzyBttA')">
                        <div class="video-one__video-icon">
                            <span class="fa fa-play"></span>
                        </div>
                    </a>
                </div>
            </div>

            <!-- Main Carousel -->
            <div class="video-one__main-content">
                <div class="video-one__carousel">
                    <div
                        v-for="(slide, i) in slides"
                        :key="'slide-' + i"
                        class="video-one__slide"
                        :class="{ active: currentIndex === i }"
                    >
                        <div class="video-one__main-content-inner">
                            <div
                                class="video-one__main-content-bg"
                                :style="{ backgroundImage: 'url(' + slide.bg + ')' }"
                            ></div>
                        </div>
                    </div>
                </div>

                <!-- Prev / Next Nav -->
                <div class="video-one__nav">
                    <button class="video-one__btn-prev" @click="prev" aria-label="Previous">
                        <i class="icon-prev"></i>
                    </button>
                    <button class="video-one__btn-next" @click="next" aria-label="Next">
                        <i class="icon-next"></i>
                    </button>
                </div>
            </div>

            <!-- Thumbnail Box -->
            <div class="video-one__thumb-box">
                <div class="video-one__thumb-list">
                    <div
                        v-for="(slide, i) in slides"
                        :key="'thumb-' + i"
                        class="video-one__img-holder-box"
                        :class="{ active: currentIndex === i }"
                        @click="goTo(i)"
                    >
                        <div class="video-one__img-holder">
                            <img :src="slide.thumb" alt="">
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <VideoPopup v-model="isVideoOpen" :videoUrl="activeVideo" />
    </section>
</template>

<script>
import bg1 from '@/assets/images/backgrounds/video-one-inner-content-bg-1-1.jpg';
import bg2 from '@/assets/images/backgrounds/video-one-inner-content-bg-1-2.jpg';
import bg3 from '@/assets/images/backgrounds/video-one-inner-content-bg-1-3.jpg';
import thumb1 from '@/assets/images/resources/video-one-thumb-img-1-1.jpg';
import thumb2 from '@/assets/images/resources/video-one-thumb-img-1-2.jpg';
import thumb3 from '@/assets/images/resources/video-one-thumb-img-1-3.jpg';
import VideoPopup from '@/components/common/VideoPopup.vue';

export default {
    name: "VideoOne",
    components: { VideoPopup },
    data() {
        return {
            currentIndex: 0,
            autoplayTimer: null,
            isVideoOpen: false,
            activeVideo: "",
            slides: [
                { bg: bg1, thumb: thumb1 },
                { bg: bg2, thumb: thumb2 },
                { bg: bg3, thumb: thumb3 },
            ]
        };
    },
    methods: {
        goTo(index) {
            this.currentIndex = (index + this.slides.length) % this.slides.length;
            this.resetAutoplay();
        },
        next() { this.goTo(this.currentIndex + 1); },
        prev() { this.goTo(this.currentIndex - 1); },
        openVideo(url) {
            this.activeVideo = url;
            this.isVideoOpen = true;
        },
        startAutoplay() {
            this.autoplayTimer = setInterval(() => {
                this.goTo(this.currentIndex + 1);
            }, 5000);
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

<style scoped>
/* Main Carousel - fade between slides */
.video-one__carousel {
    position: relative;
    width: 100%;
    height: 100%;
}

.video-one__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 800ms ease;
}

.video-one__slide.active {
    opacity: 1;
    pointer-events: auto;
    position: relative;
}

/* SVG Circular Text */
.video-one__svg-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 128px;
    height: 128px;
    transform: translate(-50%, -50%);
    overflow: visible;
    pointer-events: none;
    animation: textRotate 20s linear infinite;
}

@keyframes textRotate {
    0%   { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Fix concentric alignment: original CSS had top 56% */
.video-one__video-link {
    top: 50% !important;
}

.video-one__svg-text {
    font-size: 14.5px;
    font-weight: 700;
    fill: var(--tecture-white);
    text-transform: uppercase;
    letter-spacing: 0.11em;
    word-spacing: 0.3em;
    font-family: var(--tecture-font, sans-serif);
}

/* Thumbnail list - vertical stack */
.video-one__thumb-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    height: 100%;
}

.video-one__img-holder-box {
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    opacity: 0.5;
    transition: opacity 400ms ease;
}

.video-one__img-holder-box.active,
.video-one__img-holder-box:hover {
    opacity: 1;
}

.video-one__img-holder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 400ms ease;
}

.video-one__img-holder-box:hover .video-one__img-holder img {
    transform: scale(1.05);
}

/* Nav Buttons */
.video-one__btn-prev,
.video-one__btn-next {
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
}
</style>
