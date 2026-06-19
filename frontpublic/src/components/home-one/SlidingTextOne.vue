<template>
    <section class="sliding-text-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>

        <div class="sliding-text-one__wrap">
            <div class="sliding-text-one__track-wrapper">
                <ul class="sliding-text__list list-unstyled sliding-text-one__track">
                    <!-- Original items + duplicated for seamless loop -->
                    <li v-for="(item, i) in loopedItems" :key="i">
                        <h2
                            class="sliding-text__title"
                            :data-hover="item.label"
                        >
                            {{ item.label }}
                            <img :src="starIcon" alt="star">
                        </h2>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import starIcon from '@/assets/images/icon/star-icon.png';

export default {
    name: "SlidingTextOne",
    data() {
        return {
            sectionShape,
            starIcon,
            items: [
                { label: 'Interior Design' },
                { label: 'Luxury Homes' },
                { label: 'Construction Simulator' },
                { label: 'Architecture Design' },
            ]
        };
    },
    computed: {
        // Duplicate items 3× so the track is wide enough for seamless looping
        loopedItems() {
            return [...this.items, ...this.items, ...this.items];
        }
    }
};
</script>

<style scoped>
.sliding-text-one__track-wrapper {
    overflow: hidden;
    width: 100%;
}

.sliding-text-one__track {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    width: max-content;
    animation: marqueeSlide 25s linear infinite;
    margin: 0;
    padding: 0;
}

.sliding-text-one__track:hover {
    animation-play-state: paused;
}

.sliding-text-one__track li {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: 35px;
}

@keyframes marqueeSlide {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-33.333%); }
}
</style>