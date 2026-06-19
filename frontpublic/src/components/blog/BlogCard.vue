<template>
    <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInLeft" :data-wow-delay="delay">
        <div class="blog-one__single">
            <div class="blog-one__img">
                <img :src="image" :alt="title">
            </div>
            <div class="blog-one__content">
                <div class="blog-one__content-shape-1" :style="{ backgroundImage: 'url(' + contentShape + ')' }"></div>
                <div class="blog-one__date-and-title-box">
                    <div class="blog-one__date">
                        <h3>{{ day }}</h3>
                        <p>{{ month }}</p>
                    </div>
                    <div class="blog-one__title-box">
                        <h3 class="blog-one__title">
                            <router-link :to="link">{{ title }}</router-link>
                        </h3>
                    </div>
                </div>
                <div class="blog-one__btn-box">
                    <router-link :to="link" class="thm-btn blog-one__btn">
                        More Details <span class="icon-up-right-arrow"></span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import contentShape from '@/assets/images/shapes/blog-one-content-shape-1.png';

defineProps({
    image: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '/blog-details'
    },
    delay: {
        type: String,
        default: '100ms'
    }
});
</script>
