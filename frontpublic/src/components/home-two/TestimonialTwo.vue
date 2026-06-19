<template>
    <section class="testimonial-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + shape1 + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">What Our Clients Say</h2>
            </div>
            <div class="testimonial-two__bottom">
                
                <div class="testimonial-two__carousel-wrapper" ref="wrapper">
                    <div class="testimonial-two__carousel-nav">
                        <button class="swiper-nav-button prev-btn" @click="prevSlide" aria-label="Previous">
                            <i class="icon-left-arrow"></i>
                        </button>
                        <button class="swiper-nav-button next-btn" @click="nextSlide" aria-label="Next">
                            <i class="icon-right-arrow"></i>
                        </button>
                    </div>

                    <div 
                        class="testimonial-two__carousel-container"
                        @mousedown="startDrag"
                        @mousemove="doDrag"
                        @mouseup="endDrag"
                        @mouseleave="endDrag"
                        @touchstart="startDrag"
                        @touchmove="doDrag"
                        @touchend="endDrag"
                    >
                        <div 
                            class="testimonial-two__carousel-track"
                            :style="trackStyle"
                        >
                            <div 
                                class="testimonial-two__item" 
                                v-for="(t, index) in displayTestimonials" 
                                :key="index"
                                :style="itemStyle"
                            >
                                <div class="testimonial-two__single">
                                    <div class="testimonial-two__single-shape-1"
                                        :style="{ backgroundImage: 'url(' + singleShape + ')' }"></div>
                                    <div class="testimonial-two__img">
                                        <img :src="t.image" alt="">
                                    </div>
                                    <div class="testimonial-two__shape-1">
                                        <img :src="quoteShape" alt="">
                                    </div>
                                    <ul class="testimonial-two__ratting list-unstyled">
                                        <li><span class="icon-pointed-star"></span></li>
                                        <li><span class="icon-pointed-star"></span></li>
                                        <li><span class="icon-pointed-star"></span></li>
                                        <li><span class="icon-pointed-star"></span></li>
                                        <li><span class="icon-pointed-star"></span></li>
                                    </ul>
                                    <h3 class="testimonial-two__name">
                                        <router-link to="/testimonials">{{ t.name }}</router-link>
                                    </h3>
                                    <p class="testimonial-two__sub-title">{{ t.position }}</p>
                                    <p class="testimonial-two__text">{{ t.text }}</p>
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
import shape1 from '@/assets/images/shapes/section-shape-1.png';
import singleShape from '@/assets/images/shapes/testimonial-two-single-shape-1.png';
import quoteShape from '@/assets/images/shapes/testimonial-two-shape-1.png';
import t1 from '@/assets/images/testimonial/testimonial-2-1.jpg';
import t2 from '@/assets/images/testimonial/testimonial-2-2.jpg';
import t3 from '@/assets/images/testimonial/testimonial-2-3.jpg';
import t4 from '@/assets/images/testimonial/testimonial-2-4.jpg';
import t5 from '@/assets/images/testimonial/testimonial-2-5.jpg';
import t6 from '@/assets/images/testimonial/testimonial-2-6.jpg';

export default {
    name: "TestimonialTwo",
    data() {
        return {
            shape1, singleShape, quoteShape,
            testimonials: [
                { name: 'Michael Angenla', position: 'Project Manager', text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t1 },
                { name: 'Brenda Gregory',  position: 'CEO of Apple',     text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t2 },
                { name: 'Edward Monroe',  position: 'Senior Designer',     text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t3 },
                { name: 'Alisa Brown',  position: 'Project Manager',     text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t4 },
                { name: 'Brenda Heyden',   position: 'CEO of Apple',     text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t5 },
                { name: 'Kark Edward',   position: 'Senior Designer',     text: 'Divide carefully fruitsome sixth form beginning replenis together midst lesser to airs there brought forth him she us one seas can was void can be awrare were nots multiply image female best project.', image: t6 },
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
        displayTestimonials() {
            // Triple clones for smooth infinite scroll
            const items = this.testimonials;
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
            else if (w < 1200) this.itemsPerView = 2;
            else this.itemsPerView = 3;
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
                const total = this.testimonials.length;
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
.testimonial-two__carousel-wrapper {
    position: relative;
    width: 100%;
}

.testimonial-two__carousel-container {
    overflow: hidden;
    width: 100%;
    padding-top: 50px; /* Space for flying images */
    margin-top: -50px;
}

.testimonial-two__carousel-track {
    display: flex;
    width: 100%;
    will-change: transform;
}

.testimonial-two__item {
    padding: 0 15px;
}

.testimonial-two__carousel-nav {
    position: absolute;
    top: 50%;
    left: -100px;
    right: -100px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    pointer-events: none;
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
    outline: none;
    pointer-events: auto;
}

.prev-btn {
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.next-btn {
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
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

@media (max-width: 1400px) {
    .testimonial-two__carousel-nav {
        left: 0;
        right: 0;
    }
}

@media (max-width: 767px) {
    .testimonial-two__carousel-nav {
        display: none;
    }
}
</style>

