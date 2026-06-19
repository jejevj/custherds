<template>
    <section class="error-page">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="error-page__inner">
                <div class="error-page__img">
                    <img :src="errorImage" alt="404 Error">
                </div>
                <div class="error-page__btn-box">
                    <router-link to="/" class="thm-btn error-page__btn">
                        Back To Home <span class="icon-up-right-arrow"></span>
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import errorImage from '@/assets/images/resources/error-page-img-1.png';
</script>
