<template>
    <section class="page-header">
        <div class="page-header__bg" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }"></div>
        <div class="container">
            <div class="page-header__inner">
                <div class="page-header__title-box">
                    <p>{{ subtitle }}</p>
                    <h3>{{ title }}</h3>
                </div>
                <div class="thm-breadcrumb__box">
                    <ul class="thm-breadcrumb list-unstyled">
                        <template v-if="breadcrumbs && breadcrumbs.length > 0">
                            <template v-for="(crumb, index) in breadcrumbs" :key="index">
                                <li>
                                    <router-link v-if="crumb.link" :to="crumb.link">{{ crumb.label }}</router-link>
                                    <template v-else>{{ crumb.label }}</template>
                                </li>
                                <li v-if="index < breadcrumbs.length - 1"><span>/</span></li>
                            </template>
                        </template>
                        <template v-else>
                            <li><router-link to="/">Home</router-link></li>
                            <li><span>/</span></li>
                            <li>{{ title }}</li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { defineProps } from 'vue';

const defaultBg = 'https://www.custherds.com/assets/images/slide/page1-4.webp';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: 'Custherds — Turn Your Network into Net Worth'
    },
    backgroundImage: {
        type: String,
        default: defaultBg
    },
    breadcrumbs: {
        type: Array,
        default: null
    }
});
</script>
