<template>
    <div class="blog-details__left">
        <div class="blog-details__img">
            <img :src="image" :alt="title">
        </div>
        <div class="blog-details__content">
            <div class="blog-details__meta-and-share">
                <ul class="blog-details__meta list-unstyled">
                    <li>
                        <a href="#"><span class="icon-user"></span>By {{ author }}</a>
                    </li>
                    <li>
                        <a href="#"><span class="icon-conversation"></span>{{ comments }} Comments</a>
                    </li>
                </ul>
                <div class="blog-details__share">
                    <a href="#"><span class="fas fa-share-alt"></span></a>
                </div>
            </div>
            <h3 class="blog-details__title-1">{{ title }}</h3>
            <p class="blog-details__text-1">{{ content1 }}</p>
            <p class="blog-details__text-2">{{ content2 }}</p>
        </div>
        <div class="blog-details__tag-box">
            <p class="blog-details__tag-title">Tags :</p>
            <div class="blog-details__tag-list">
                <a v-for="(tag, index) in tags" :key="index" href="#">{{ tag }}</a>
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
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Admin'
    },
    comments: {
        type: Number,
        default: 6
    },
    content1: {
        type: String,
        required: true
    },
    content2: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        default: () => []
    }
});
</script>
