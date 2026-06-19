<template>
    <section class="sliding-text-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="sliding-text-two__wrap">
            <div class="sliding-text-two__marquee">
                <!-- Original List -->
                <ul class="sliding-text-two__list list-unstyled">
                    <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                    <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                     <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                </ul>
                <!-- Cloned List for Infinite Loop -->
                <ul class="sliding-text-two__list list-unstyled" aria-hidden="true">
                    <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                    <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                     <li><h2 data-hover="Interior Design" class="sliding-text-two__title">Interior Design</h2></li>
                    <li><h2 data-hover="luxury homes" class="sliding-text-two__title">luxury homes</h2></li>
                    <li><h2 data-hover="construction simulator" class="sliding-text-two__title">construction simulator</h2></li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
</script>

<style scoped>
.sliding-text-two__wrap {
    overflow: hidden;
    position: relative;
    width: 100%;
}

.sliding-text-two__marquee {
    display: flex;
    width: fit-content;
    animation: scrollMarquee 80s linear infinite;
}

.sliding-text-two__marquee:hover {
    animation-play-state: paused;
}

.sliding-text-two__list {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin: 0;
    padding: 0;
}

.sliding-text-two__list li {
    flex-shrink: 0;
    white-space: nowrap;
}

.sliding-text-two__title {
    white-space: nowrap;
}

@keyframes scrollMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
</style>

