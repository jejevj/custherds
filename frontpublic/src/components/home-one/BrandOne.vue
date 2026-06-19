<template>
    <section class="brand-one">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="brand-one__carousel-wrapper" ref="wrapper">
                <div 
                    class="brand-one__carousel-track" 
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                    @pointerleave="onPointerUp"
                    :style="{
                        transform: `translateX(calc(-${offsetPercent}% + ${dragOffsetPx}px))`,
                        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }"
                >
                    <div 
                        v-for="brand in displayBrands" 
                        :key="brand.id"
                        class="brand-one__item"
                        :style="{ flex: `0 0 ${100 / itemsPerView}%`, maxWidth: `${100 / itemsPerView}%` }"
                    >
                        <div class="brand-one__img">
                            <a href="#"><img :src="brand.src" alt=""></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import br1 from '@/assets/images/brand/brand-1-1.png';
import br2 from '@/assets/images/brand/brand-1-2.png';
import br3 from '@/assets/images/brand/brand-1-3.png';
import br4 from '@/assets/images/brand/brand-1-4.png';
import br5 from '@/assets/images/brand/brand-1-5.png';
import br6 from '@/assets/images/brand/brand-1-6.png';

export default {
    name: "BrandOne",
    data() {
        return {
            displayBrands: [],
            itemsPerView: 6,
            offsetPercent: 0,
            isTransitioning: false,
            autoplayTimer: null,
            // Drag states
            isDragging: false,
            startX: 0,
            dragOffsetPx: 0
        };
    },
    mounted() {
        this.initItems();
        window.addEventListener('resize', this.updateItemsPerView);
        this.updateItemsPerView();
        
        // Let component mount before starting autoplay
        this.$nextTick(() => {
            this.startAutoplay();
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateItemsPerView);
        clearInterval(this.autoplayTimer);
    },
    methods: {
        initItems() {
            const baseUrls = [br1, br2, br3, br4, br5, br6];
            let id = 0;
            // 3 fully cloned sets = 18 items buffer (more than enough to fill 6 views + loop)
            this.displayBrands = [...baseUrls, ...baseUrls, ...baseUrls].map(src => ({
                id: id++,
                src
            }));
        },
        updateItemsPerView() {
            const w = window.innerWidth;
            if (w < 520) this.itemsPerView = 1;
            else if (w < 768) this.itemsPerView = 2;
            else if (w < 992) this.itemsPerView = 2; // Matches OwlCarousel config breaks
            else if (w < 1200) this.itemsPerView = 4;
            else if (w < 1400) this.itemsPerView = 5;
            else this.itemsPerView = 6;
        },
        startAutoplay() {
            if (this.autoplayTimer) clearInterval(this.autoplayTimer);
            this.autoplayTimer = setInterval(() => {
                this.nextSlide();
            }, 3000); // reduced from 7000ms for better perceived activity
        },
        
        // --- Manual Dragging Logic ---
        onPointerDown(e) {
            // Only left clicks or touches
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            this.isDragging = true;
            this.startX = e.clientX;
            this.isTransitioning = false; // pause active slide transitions on grab
            clearInterval(this.autoplayTimer);
        },
        onPointerMove(e) {
            if (!this.isDragging) return;
            this.dragOffsetPx = e.clientX - this.startX;
        },
        onPointerUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            const trackWidth = this.$refs.wrapper.offsetWidth;
            const itemWidth = trackWidth / this.itemsPerView;
            
            // If dragged left by at least 20% of one item's width, go next
            if (this.dragOffsetPx < -(itemWidth * 0.2)) {
                this.dragOffsetPx = 0;
                this.nextSlide();
            } 
            // If dragged right by at least 20%
            else if (this.dragOffsetPx > (itemWidth * 0.2)) {
                this.dragOffsetPx = 0;
                this.prevSlide();
            } 
            // Otherwise snap back
            else {
                this.isTransitioning = true;
                this.dragOffsetPx = 0;
            }
            this.startAutoplay(); // resume after dragging
        },

        // --- Core Sliding Logic ---
        nextSlide() {
            if (this.isTransitioning) return;
            
            this.isTransitioning = true;
            
            // Use Vue's next tick to ensure transition style is active before moving
            this.$nextTick(() => {
                // A small timeout ensures browser paints the transition property first
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.offsetPercent = 100 / this.itemsPerView;
                        
                        setTimeout(() => {
                            this.isTransitioning = false;
                            this.offsetPercent = 0; 
                            
                            const shifted = this.displayBrands.shift();
                            this.displayBrands.push(shifted);
                        }, 500);
                    });
                });
            });
        },
        prevSlide() {
            if (this.isTransitioning) return;
            
            // To go backwards seamlessly, we instantly shift the array right, offset negatively, then transition back to 0
            this.isTransitioning = false;
            const popped = this.displayBrands.pop();
            this.displayBrands.unshift(popped);
            this.offsetPercent = 100 / this.itemsPerView; 
            
            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.isTransitioning = true;
                        this.offsetPercent = 0; // slide back into view
                        
                        setTimeout(() => {
                            this.isTransitioning = false;
                        }, 500);
                    });
                });
            });
        }
    }
};
</script>

<style scoped>
/* Pure CSS Carousel Engine */
.brand-one__carousel-wrapper {
    overflow: hidden;
    width: 100%;
}

.brand-one__carousel-track {
    display: flex;
    flex-wrap: nowrap;
    width: 100%; /* 100% of the wrapper container */
}

.brand-one__item {
    flex-shrink: 0;
    /* We calculate exact widths via inline JS styles, ensuring responsiveness */
}

/* Original owl carousel style mapping for brand img border logic */
.brand-one__img {
    position: relative;
    display: block;
}

.brand-one__img a {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid rgba(255, 255, 255, 0.1); /* Matches dark boundary box */
    padding: 39px 0 39px;
}

.brand-one__img a img {
    width: auto !important;
    max-width: 100%;
    margin: 0 auto;
    transition: opacity 500ms ease;
}

.brand-one__img a:hover img {
    opacity: 0.5;
}
</style>
