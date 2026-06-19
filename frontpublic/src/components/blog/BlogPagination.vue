<template>
    <div class="blog-page__pagination">
        <ul class="pg-pagination list-unstyled">
            <li class="prev">
                <a href="#" aria-label="Prev" @click.prevent="$emit('page-change', currentPage - 1)">
                    <i class="icon-left-arrow"></i>
                </a>
            </li>
            <li 
                v-for="page in totalPages" 
                :key="page"
                class="count"
                :class="{ active: page === currentPage }"
            >
                <a href="#" @click.prevent="$emit('page-change', page)">{{ page }}</a>
            </li>
            <li class="next">
                <a href="#" aria-label="Next" @click.prevent="$emit('page-change', currentPage + 1)">
                    <i class="icon-right-arrow"></i>
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup>
defineProps({
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 3
    }
});

defineEmits(['page-change']);
</script>
