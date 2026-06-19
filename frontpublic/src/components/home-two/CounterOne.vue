<template>
    <section class="counter-one">
        <div class="counter-one__shape">
            <img class="float-bob-x" src="@/assets/images/shapes/counter-one-shape1.png" alt="Shape">
        </div>
        <div class="counter-one__shape-1"
            :style="{ backgroundImage: 'url(' + counterOneShape + ')' }"></div>
        <div class="container">
            <div class="counter-one__inner">
                <div class="counter-one__title-box" style="display: none;">
                    <div class="section-title text-left sec-title-animation animation-style1">
                        <h2 class="section-title__title title-animation">Professional Experience</h2>
                        <div class="counter-one__title-border"></div>
                    </div>
                </div>
                <ul class="list-unstyled counter-one__list" ref="counterList">
                    <li v-for="(item, index) in counterItems" :key="index" class="wow fadeInLeft" :data-wow-delay="(index * 200) + 100 + 'ms'">
                        <div class="counter-one__single">
                            <div class="counter-one__counter-box">
                                <h3 class="odometer">{{ displayCounts[index] }}</h3>
                                <span class="counter-one__counter-letter">k</span>
                                <span class="counter-one__counter-plus">+</span>
                            </div>
                            <p class="counter-one__counter-text">{{ item.text }}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import counterOneShape from '@/assets/images/shapes/counter-one-shape-1.png';

export default {
    name: "CounterOne",
    data() {
        return {
            counterOneShape,
            counterItems: [
                { count: 13,  text: "Project Complete" },
                { count: 179, text: "Happy Clients" },
                { count: 33,  text: "Clients Project" },
                { count: 55,  text: "Success Rating" }
            ],
            displayCounts: [0, 0, 0, 0]
        };
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$refs.counterList) {
                this._observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        this.startCounters();
                        this._observer.disconnect();
                    }
                }, { threshold: 0.2 });
                this._observer.observe(this.$refs.counterList);
            }
        });
    },
    beforeUnmount() {
        if (this._observer) this._observer.disconnect();
        if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    },
    methods: {
        startCounters() {
            const duration = 2000;
            const start = performance.now();
            const animate = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                this.displayCounts = this.counterItems.map(item => Math.ceil(progress * item.count));
                if (progress < 1) {
                    this._animationFrame = requestAnimationFrame(animate);
                }
            };
            this._animationFrame = requestAnimationFrame(animate);
        }
    }
};
</script>
