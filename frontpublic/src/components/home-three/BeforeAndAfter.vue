<template>
    <section class="before-and-after">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Interior Design Conversion</h2>
            </div>
            <p class="before-and-after__text">Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.<br> Lorem Ipsum has been the industry's standard dummy text.</p>
            <div class="before-and-after__img-box">
                <div class="before-after">
                    <!-- Pure-JS recreated twentytwenty structure -->
                    <div class="twentytwenty-container twentytwenty-horizontal" ref="container">
                        <img class="twentytwenty-before" :src="img1" alt="Before">
                        <img class="twentytwenty-after"  :src="img2" alt="After">
                        <div class="twentytwenty-overlay">
                            <div class="twentytwenty-before-label" data-content="Before"></div>
                            <div class="twentytwenty-after-label"  data-content="After"></div>
                        </div>
                        <div class="twentytwenty-handle" ref="handle">
                            <span class="twentytwenty-left-arrow"></span>
                            <span class="twentytwenty-right-arrow"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import img1 from '@/assets/images/resources/before-and-after-img-1.jpg';
import img2 from '@/assets/images/resources/before-and-after-img-2.jpg';

export default {
    name: "BeforeAndAfter",
    data() {
        return { sectionShape, img1, img2 };
    },
    mounted() {
        this.$nextTick(() => {
            this.initSlider();
        });
    },
    beforeUnmount() {
        this.destroySlider();
    },
    methods: {
        initSlider() {
            const container = this.$refs.container;
            const handle    = this.$refs.handle;
            if (!container || !handle) return;

            // Wait for images to load then set container height
            const beforeImg = container.querySelector('.twentytwenty-before');
            const afterImg  = container.querySelector('.twentytwenty-after');
            if (!beforeImg || !afterImg) return;

            const ready = () => {
                container.style.height = afterImg.offsetHeight + 'px';
                this.setClip(container, beforeImg, 0.5);
                this.positionHandle(container, handle, 0.5);
            };

            if (afterImg.complete) {
                ready();
            } else {
                afterImg.addEventListener('load', ready, { once: true });
            }

            // Drag logic
            let dragging = false;

            this._onStart = (e) => {
                dragging = true;
                e.preventDefault();
                container.classList.add('active');
            };

            this._onMove = (e) => {
                if (!dragging) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const rect = container.getBoundingClientRect();
                const pct  = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                this.setClip(container, beforeImg, pct);
                this.positionHandle(container, handle, pct);
            };

            this._onEnd = () => {
                dragging = false;
            };

            handle.addEventListener('mousedown',  this._onStart);
            handle.addEventListener('touchstart', this._onStart, { passive: false });
            window.addEventListener('mousemove',  this._onMove);
            window.addEventListener('touchmove',  this._onMove, { passive: true });
            window.addEventListener('mouseup',    this._onEnd);
            window.addEventListener('touchend',   this._onEnd);

            // Resize: recalculate height
            this._onResize = () => {
                if (afterImg.complete) {
                    container.style.height = afterImg.offsetHeight + 'px';
                    const handleLeft = parseFloat(handle.style.left) || 50;
                    const currentPct = handleLeft / 100;
                    this.setClip(container, beforeImg, currentPct);
                    this.positionHandle(container, handle, currentPct);
                }
            };
            window.addEventListener('resize', this._onResize);
        },

        setClip(container, beforeImg, pct) {
            // Clip the "before" image using clip-path
            beforeImg.style.clipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
            beforeImg.style.webkitClipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
        },

        positionHandle(container, handle, pct) {
            // Let twentytwenty.css margin-left: -29px handle centering
            handle.style.left = `${pct * 100}%`;
            handle.style.marginLeft = ''; // clear any inline override
        },

        destroySlider() {
            const handle = this.$refs?.handle;
            if (handle) {
                handle.removeEventListener('mousedown',  this._onStart);
                handle.removeEventListener('touchstart', this._onStart);
            }
            window.removeEventListener('mousemove',  this._onMove);
            window.removeEventListener('touchmove',  this._onMove);
            window.removeEventListener('mouseup',    this._onEnd);
            window.removeEventListener('touchend',   this._onEnd);
            window.removeEventListener('resize',     this._onResize);
        }
    }
};
</script>

<style scoped>
/* Ensure container clips correctly and images stack */
.twentytwenty-container {
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
}

.twentytwenty-container img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
}

/* before sits on top with clip, after sits below */
.twentytwenty-before {
    z-index: 20;
}
.twentytwenty-after {
    z-index: 10;
    /* reference image — not clipped */
    clip-path: none !important;
    -webkit-clip-path: none !important;
    position: relative !important;
}

/* Overlay covers both images for hover labels */
.twentytwenty-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 25;
    pointer-events: none;
}
</style>
