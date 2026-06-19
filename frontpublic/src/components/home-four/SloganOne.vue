<template>
    <section class="slogan-one">
        <div class="slogan-one__bg jarallax" data-jarallax data-speed="0.3" data-imgPosition="100% 100%"
            :style="{ backgroundImage: 'url(' + bg + ')' }">
        </div>
        <div class="container">
            <div class="slogan-one__content text-center">
                <div class="title">
                    <h3>Being the largest in-home decorationg service in newyork city</h3>
                    <h4>15% Discount on your First Work Session!..</h4>
                    <p>Our expert instructors are here to answer you every step of the question!.</p>
                </div>
                <div class="btn-box">
                    <router-link to="/contact" class="thm-btn">
                        schedule Now
                        <span class="icon-up-right-arrow"></span> </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted } from 'vue';
import sloganBg from '@/assets/images/backgrounds/slogan-1__bg.jpg';

const bg = sloganBg;

onMounted(() => {
    // jarallax — pure JS API (script loaded in index.html)
    if (typeof window.jarallax === 'function') {
        window.jarallax(document.querySelectorAll('.jarallax'), { speed: 0.2 });
    }
});
</script>

