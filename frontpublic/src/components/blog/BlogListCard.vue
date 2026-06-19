<template>
    <div class="blog-two-single">
        <div class="img-box">
            <img :src="image" :alt="title">
        </div>
        <div class="content-box">
            <div class="meta-box">
                <div class="date-box">
                    <h3>{{ day }}</h3>
                    <p>{{ month }}</p>
                </div>
                <ul class="meta-info list-unstyled">
                    <li>
                        <a href="#">
                            <span class="icon-user"></span>
                            {{ author }}
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <span class="icon-conversation"></span>
                            ({{ comments }}) Comment
                        </a>
                    </li>
                </ul>
            </div>
            <div class="title-box">
                <h3>
                    <router-link :to="link">{{ title }}</router-link>
                </h3>
            </div>
            <div class="text-box">
                <p>{{ excerpt }}</p>
            </div>
            <div class="btn-box">
                <router-link :to="link" class="thm-btn">
                    More Details
                    <span class="icon-up-right-arrow"></span>
                </router-link>
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
    day: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'David Wood'
    },
    comments: {
        type: String,
        default: '1k'
    },
    title: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '/blog-details'
    }
});
</script>
