<template>
    <section class="project-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape1 + ')' }"></div>
        <div class="project-two__top">
            <div class="container">
                <div class="section-title text-left sec-title-animation animation-style2">
                    <h2 class="section-title__title title-animation">Designing <br> Defining Spaces</h2>
                </div>
            </div>
        </div>
        <div class="project-two__bottom">
            <div class="container">
                <div class="project-two__carousel-wrapper" ref="carouselWrapper">
                    <div class="project-two__carousel-nav">
                        <button class="project-two__swiper-prev" @click="prev" aria-label="Previous"><span class="icon-left-arrow"></span></button>
                        <button class="project-two__swiper-next" @click="next" aria-label="Next"><span class="icon-right-arrow"></span></button>
                    </div>
                    
                    <div class="project-two__carousel-container"
                        @mousedown="startDrag"
                        @mousemove="doDrag"
                        @mouseup="endDrag"
                        @mouseleave="endDrag"
                        @touchstart="startDrag"
                        @touchmove="doDrag"
                        @touchend="endDrag"
                    >
                        <div class="project-two__carousel-track" :style="trackStyle">
                            <div v-for="(project, index) in displayItems" :key="index" class="project-two__item" :style="itemStyle">
                                <div class="project-two__single">
                                    <div class="project-two__img">
                                        <img :src="project.image" :alt="project.title">
                                    </div>
                                    <div class="project-two__content">
                                        <h3 class="project-two__title">
                                            <router-link to="/project-details">{{ project.title }}</router-link>
                                        </h3>
                                        <div class="project-two__arrow">
                                            <a :href="project.image" class="img-popup" @click.prevent="openPopup(index)">
                                                <span class="icon-up-right-arrow-1"></span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Popup -->
        <ImagePopup v-model="isPopupOpen" v-model:initialIndex="popupIndex" :images="displayItems" />
    </section>
</template>

<script>
import p1 from '@/assets/images/project/projects-2-1.jpg';
import p2 from '@/assets/images/project/projects-2-2.jpg';
import p3 from '@/assets/images/project/projects-2-3.jpg';
import sectionShape1 from '@/assets/images/shapes/section-shape-1.png';
import ImagePopup from '@/components/common/ImagePopup.vue';

export default {
    name: 'ProjectTwo',
    components: {
        ImagePopup
    },
    data() {
        return {
            sectionShape1,
            isPopupOpen: false,
            popupIndex: 0,
            projects: [
                { title: 'Industrial Chic Restaurant', image: p1 },
                { title: 'Amman Rotane Hotel', image: p2 },
                { title: 'Harmony Interiors', image: p3 },
                { title: 'Industrial Chic Restaurant', image: p1 },
                { title: 'Amman Rotane Hotel', image: p2 },
                { title: 'Harmony Interiors', image: p3 },
            ],
            currentIndex: 3, // Start at the first real item (after the cloned ones)
            itemWidth: 0,
            itemsPerView: 3,
            isTransitioning: false,
            startX: 0,
            currentTranslate: 0,
            prevTranslate: 0,
            isDragging: false,
            autoplayInterval: null
        }
    },
    computed: {
        displayItems() {
            // Clone items for infinite scroll: [last 3] + [all items] + [first 3]
            const items = this.projects;
            const lastThree = items.slice(-3);
            const firstThree = items.slice(0, 3);
            return [...lastThree, ...items, ...firstThree];
        },
        trackStyle() {
            return {
                transform: `translateX(calc(-${this.currentIndex * (100 / this.itemsPerView)}% + ${this.currentTranslate}px))`,
                transition: this.isTransitioning ? 'transform 0.5s ease' : 'none',
                cursor: this.isDragging ? 'grabbing' : 'grab'
            }
        },
        itemStyle() {
            return {
                flex: `0 0 ${100 / this.itemsPerView}%`,
                maxWidth: `${100 / this.itemsPerView}%`
            }
        }
    },
    mounted() {
        this.updateItemsPerView();
        window.addEventListener('resize', this.updateItemsPerView);
        this.startAutoplay();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateItemsPerView);
        this.stopAutoplay();
    },
    methods: {
        updateItemsPerView() {
            if (window.innerWidth < 768) {
                this.itemsPerView = 1;
            } else if (window.innerWidth < 1200) {
                this.itemsPerView = 2;
            } else {
                this.itemsPerView = 3;
            }
            // Reset to a safe index on resize to avoid layout breaks
            this.currentIndex = this.itemsPerView; 
        },
        next() {
            if (this.isTransitioning) return;
            this.stopAutoplay();
            this.isTransitioning = true;
            this.currentIndex++;
            this.handleInfinite();
            this.startAutoplay();
        },
        prev() {
            if (this.isTransitioning) return;
            this.stopAutoplay();
            this.isTransitioning = true;
            this.currentIndex--;
            this.handleInfinite();
            this.startAutoplay();
        },
        handleInfinite() {
            setTimeout(() => {
                const totalProjects = this.projects.length;
                if (this.currentIndex >= totalProjects + 3) {
                    this.isTransitioning = false;
                    this.currentIndex = 3;
                } else if (this.currentIndex <= 2) {
                    this.isTransitioning = false;
                    this.currentIndex = totalProjects + 2;
                }
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 50);
            }, 500);
        },
        startAutoplay() {
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, 5000);
        },
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
            }
        },
        startDrag(e) {
            this.isDragging = true;
            this.startX = this.getPositionX(e);
            this.stopAutoplay();
            this.isTransitioning = false;
        },
        doDrag(e) {
            if (!this.isDragging) return;
            const currentX = this.getPositionX(e);
            this.currentTranslate = currentX - this.startX;
        },
        endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;
            const movedBy = this.currentTranslate;

            if (movedBy < -100) {
                this.next();
            } else if (movedBy > 100) {
                this.prev();
            } else {
                this.isTransitioning = true;
            }
            this.currentTranslate = 0;
            this.startAutoplay();
        },
        getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        },
        openPopup(index) {
            this.popupIndex = index;
            this.isPopupOpen = true;
        }
    }
}
</script>

<style scoped>
.project-two__carousel-wrapper {
    position: relative;
    width: 100%;
}

.project-two__carousel-container {
    overflow: hidden;
    width: 100%;
    padding-top: 50px; /* Space for the top decorative border */
    padding-bottom: 50px; /* Space for the bottom title box */
    margin-top: -50px;
    margin-bottom: -50px;
}

.project-two__carousel-track {
    display: flex;
    width: 100%;
    will-change: transform;
}

.project-two__item {
    padding: 0 15px; /* Matches the 30px gap of Owl Carousel (15px each side) */
}

/* Ensuring the nav matches the projects.css positioning */
.project-two__carousel-nav {
    position: absolute;
    top: -197px;
    right: 140px;
    display: flex;
    z-index: 10;
}

@media (max-width: 1199px) {
    .project-two__carousel-nav {
        top: -120px;
        right: 15px;
    }
}

@media (max-width: 767px) {
    .project-two__carousel-nav {
        position: relative;
        top: 0;
        right: 0;
        justify-content: center;
        margin-bottom: 30px;
    }
}
</style>

