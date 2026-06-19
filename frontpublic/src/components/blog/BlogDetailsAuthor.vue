<template>
    <div class="blog-details__client-info">
        <div class="blog-details__client-img">
            <img :src="image" :alt="name">
        </div>
        <div class="blog-details__client-content">
            <h3>{{ name }}</h3>
            <p>{{ bio }}</p>
            <div class="blog-details__client-social">
                <div class="blog-details__client-social-title">
                    <h4>Share :</h4>
                </div>
                <div class="blog-details__client-social-list">
                    <a v-for="(social, index) in socialLinks" :key="index" :href="social.url">
                        <span :class="social.icon"></span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    socialLinks: {
        type: Array,
        default: () => []
    }
});
</script>
