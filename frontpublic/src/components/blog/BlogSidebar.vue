<template>
    <div class="sidebar">
        <!-- Search Box -->
        <div class="sidebar__single sidebar__search">
            <form action="#" class="sidebar__search-form">
                <input type="search" placeholder="Search Keyword">
                <button type="submit"><i class="icon-search-interface-symbol"></i></button>
            </form>
        </div>

        <!-- Latest Posts -->
        <div class="sidebar__single sidebar__post">
            <h3 class="sidebar__title">Latest Post</h3>
            <ul class="sidebar__post-list list-unstyled">
                <li v-for="(post, index) in latestPosts" :key="index">
                    <div class="sidebar__post-image">
                        <img :src="post.image" alt="">
                    </div>
                    <div class="sidebar__post-content">
                        <p class="sidebar__post-date">
                            <span class="icon-calendar"></span>{{ post.date }}
                        </p>
                        <h3>
                            <router-link :to="post.link">{{ post.title }}</router-link>
                        </h3>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Categories -->
        <div class="sidebar__single sidebar__all-category">
            <h3 class="sidebar__title">Categories</h3>
            <ul class="sidebar__all-category-list list-unstyled">
                <li v-for="(category, index) in categories" :key="index">
                    <a href="#">{{ category.name }}<span>({{ category.count }})</span></a>
                </li>
            </ul>
        </div>

        <!-- Query Box -->
        <div class="sidebar__single have-any-query">
            <h3 class="have-any-query__title">Have Any Query?</h3>
            <p class="have-any-query__text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod</p>
            <div class="have-any-query__btn-box">
                <router-link to="/about" class="thm-btn have-any-query__btn">Send Massage</router-link>
            </div>
        </div>

        <!-- Tags -->
        <div class="sidebar__single sidebar__tags">
            <h3 class="sidebar__title">Tags</h3>
            <div class="sidebar__tags-list">
                <a v-for="(tag, index) in tags" :key="index" href="#">{{ tag }}</a>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    latestPosts: {
        type: Array,
        default: () => []
    },
    categories: {
        type: Array,
        default: () => []
    },
    tags: {
        type: Array,
        default: () => []
    }
});
</script>
