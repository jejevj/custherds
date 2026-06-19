<template>
    <div class="service-details__right">
        <div class="service-details__img">
            <img :src="mainImage" alt="">
        </div>
        <h3 class="service-details__title-1">{{ title }}</h3>
        <p class="service-details__text-1">{{ description }}</p>
        <p class="service-details__text-2">{{ description2 }}</p>
        <div class="service-details__img-and-point-box">
            <div class="service-details__points-img">
                <img :src="pointsImage" alt="">
            </div>
            <div class="service-details__points-box">
                <h3 class="service-details__points-title">{{ pointsTitle }}</h3>
                <ul class="service-details__points-list list-unstyled">
                    <li v-for="(point, index) in points" :key="index">
                        <div class="service-details__points-shape"></div>
                        <p>{{ point }}</p>
                    </li>
                </ul>
            </div>
        </div>
        <h3 class="service-details__title-2">{{ strengthsTitle }}</h3>
        <p class="service-details__text-3">{{ strengthsText }}</p>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Evolve Space Designs'
    },
    mainImage: {
        type: String,
        required: true
    },
    pointsImage: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    description2: {
        type: String,
        default: ''
    },
    pointsTitle: {
        type: String,
        default: 'Global QuantumTech AI'
    },
    points: {
        type: Array,
        default: () => []
    },
    strengthsTitle: {
        type: String,
        default: 'Our Strengths And Advantages'
    },
    strengthsText: {
        type: String,
        default: ''
    }
});
</script>
