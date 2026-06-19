<template>
    <div class="comment-one">
        <h3 class="comment-one__title">Recent Comments</h3>
        <div 
            v-for="(comment, index) in comments" 
            :key="index"
            class="comment-one__single"
            :class="{ 'comment-one__single-2': index > 0 }"
        >
            <div class="comment-one__image">
                <img :src="comment.image" :alt="comment.name">
            </div>
            <div class="comment-one__content">
                <h3>{{ comment.name }}</h3>
                <span>{{ comment.date }}</span>
                <p>{{ comment.text }}</p>
                <div class="comment-one__btn-box">
                    <a href="#" class="comment-one__btn" @click.prevent="$emit('reply', comment)">reply</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    comments: {
        type: Array,
        default: () => []
    }
});

defineEmits(['reply']);
</script>
