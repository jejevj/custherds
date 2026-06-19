<template>
    <section class="blog-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="blog-two__top-header">
                <div class="section-title text-left sec-title-animation animation-style2 mb-0">
                    <h2 class="section-title__title title-animation">Unleash Your Creativity with <br> Interior Inspiration</h2>
                </div>
                
                <div class="blog-two__carousel-nav">
                    <button class="swiper-prev" @click="prevSlide" aria-label="Previous">
                        <span class="icon-left-arrow"></span>
                    </button>
                    <button class="swiper-next" @click="nextSlide" aria-label="Next">
                        <span class="icon-right-arrow"></span>
                    </button>
                </div>
            </div>

            <div class="blog-two__carousel-wrapper">
                <div 
                    class="blog-two__carousel-container"
                    @mousedown="startDrag"
                    @mousemove="doDrag"
                    @mouseup="endDrag"
                    @mouseleave="endDrag"
                    @touchstart="startDrag"
                    @touchmove="doDrag"
                    @touchend="endDrag"
                >
                    <div 
                        class="blog-two__carousel-track"
                        :style="trackStyle"
                    >
                        <div 
                            class="blog-two__item" 
                            v-for="(post, index) in displayPosts" 
                            :key="index"
                            :style="itemStyle"
                        >
                            <div class="blog-two__single">
                                <div class="blog-two__img">
                                    <img :src="post.image" alt="" @dragstart.prevent>
                                    <div class="blog-two__date">
                                        <p>{{ post.dateDay }}</p>
                                        <h5>{{ post.dateMonth }}</h5>
                                    </div>
                                    <div class="blog-two__btn-box">
                                        <router-link to="/blog-details" class="thm-btn blog-two__btn">More Details <span class="icon-up-right-arrow"></span></router-link>
                                    </div>
                                </div>
                                <div class="blog-two__content">
                                    <h3 class="blog-two__title">
                                        <router-link to="/blog-details">{{ post.title }}</router-link>
                                    </h3>
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
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import blog1 from "@/assets/images/blog/blog-2-1.jpg";
import blog2 from "@/assets/images/blog/blog-2-2.jpg";
import blog3 from "@/assets/images/blog/blog-2-3.jpg";

export default {
    name: "BlogTwo",
    data() {
        return {
            sectionShape,
            posts: [
                { title: "Inspiring Designs for Inspired Where InnovationMeets", image: blog1, dateDay: "17", dateMonth: "Dec" },
                { title: "It is a long established fact that a reader will be distracted", image: blog2, dateDay: "17", dateMonth: "Dec" },
                { title: "Lorem Ipsum is simply dummy text of the printing and typesetting", image: blog3, dateDay: "17", dateMonth: "Dec" },
                { title: "Inspiring Designs for Inspired Where InnovationMeets", image: blog1, dateDay: "17", dateMonth: "Dec" },
                { title: "It is a long established fact that a reader will be distracted", image: blog2, dateDay: "17", dateMonth: "Dec" },
                { title: "Lorem Ipsum is simply dummy text of the printing and typesetting", image: blog3, dateDay: "17", dateMonth: "Dec" }
            ],
            currentIndex: 3, 
            itemsPerView: 3,
            isTransitioning: false,
            startX: 0,
            currentTranslate: 0,
            isDragging: false,
            autoplayInterval: null
        };
    },
    computed: {
        displayPosts() {
            // Triple clones for smooth infinite scroll
            const items = this.posts;
            return [...items.slice(-3), ...items, ...items.slice(0, 3)];
        },
        trackStyle() {
            return {
                transform: `translateX(calc(-${this.currentIndex * (100 / this.itemsPerView)}% + ${this.currentTranslate}px))`,
                transition: this.isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                cursor: this.isDragging ? 'grabbing' : 'grab'
            };
        },
        itemStyle() {
            return {
                flex: `0 0 ${100 / this.itemsPerView}%`,
                maxWidth: `${100 / this.itemsPerView}%`
            };
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
            const w = window.innerWidth;
            if (w < 768) this.itemsPerView = 1;
            else if (w < 992) this.itemsPerView = 2;
            else this.itemsPerView = 3;
            // Align current index based on cloned padding
            this.currentIndex = this.itemsPerView === 3 ? 3 : this.itemsPerView;
        },
        nextSlide() {
            if (this.isTransitioning) return;
            this.isTransitioning = true;
            this.currentIndex++;
            this.handleInfinite();
        },
        prevSlide() {
            if (this.isTransitioning) return;
            this.isTransitioning = true;
            this.currentIndex--;
            this.handleInfinite();
        },
        handleInfinite() {
            setTimeout(() => {
                const total = this.posts.length;
                if (this.currentIndex >= total + 3) {
                    this.isTransitioning = false;
                    this.currentIndex = 3;
                } else if (this.currentIndex <= 2) {
                    this.isTransitioning = false;
                    this.currentIndex = total + 2;
                }
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 50);
            }, 500);
        },
        startAutoplay() {
            this.autoplayInterval = setInterval(() => {
                this.nextSlide();
            }, 5000);
        },
        stopAutoplay() {
            if (this.autoplayInterval) clearInterval(this.autoplayInterval);
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
            if (movedBy < -100) this.nextSlide();
            else if (movedBy > 100) this.prevSlide();
            else this.isTransitioning = true;
            this.currentTranslate = 0;
            this.startAutoplay();
        },
        getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }
    }
};
</script>

<style scoped>
.blog-two__top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 50px;
}

.section-title.mb-0 {
    margin-bottom: 0 !important;
}

.blog-two__carousel-wrapper {
    position: relative;
    width: 100%;
}

.blog-two__carousel-container {
    overflow: hidden;
    width: 100%;
    margin: 0 -15px; 
    padding: 0 15px 30px 15px; /* Added bottom padding so border-bottom is visible */
    margin-bottom: -30px; /* Compensate for the extra padding */
}

.blog-two__carousel-track {
    display: flex;
    width: 100%;
    will-change: transform;
}

.blog-two__item {
    padding: 0 15px;
}

.blog-two__carousel-nav {
    display: flex;
    gap: 10px;
}

.blog-two__carousel-nav button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 82px;
    width: 82px;
    background-color: var(--tecture-base);
    color: var(--tecture-white);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    transition: all 500ms ease;
    border: none;
    cursor: pointer;
    font-size: 22px;
}

.blog-two__carousel-nav button:hover {
    background-color: var(--tecture-white);
    color: var(--tecture-base);
}

@media (max-width: 991px) {
    .blog-two__top-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 30px;
    }
}
</style>
