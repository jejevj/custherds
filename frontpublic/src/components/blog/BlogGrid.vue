<template>
    <section class="blog-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <BlogCard
                    v-for="(blog, index) in blogs"
                    :key="index"
                    :image="blog.image"
                    :day="blog.day"
                    :month="blog.month"
                    :title="blog.title"
                    :link="blog.link"
                    :delay="blog.delay"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import BlogCard from './BlogCard.vue';
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

defineProps({
    blogs: {
        type: Array,
        required: true
    }
});
</script>
