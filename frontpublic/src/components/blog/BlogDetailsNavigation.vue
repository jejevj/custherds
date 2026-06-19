<template>
    <div class="blog-details__pagenation-box">
        <ul class="list-unstyled blog-details__pagenation">
            <li v-if="prevPost">
                <div class="icon">
                    <router-link :to="prevPost.link"><span class="icon-left"></span></router-link>
                </div>
                <p v-html="prevPost.title"></p>
            </li>
            <li v-if="nextPost">
                <p v-html="nextPost.title"></p>
                <div class="icon">
                    <router-link :to="nextPost.link"><span class="icon-right"></span></router-link>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
defineProps({
    prevPost: {
        type: Object,
        default: null
    },
    nextPost: {
        type: Object,
        default: null
    }
});
</script>
