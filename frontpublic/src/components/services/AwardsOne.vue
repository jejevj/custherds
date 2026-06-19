<template>
    <section class="awards-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">Our Company Awards <br> & Achievements</h2>
            </div>
            <div class="row">
                <div class="col-xl-7">
                    <div class="awards-one__left">
                        <ul class="list-unstyled awards-one__list">
                            <li v-for="(award, index) in awards" :key="index"
                                class="wow fadeInLeft" :data-wow-delay="award.delay">
                                <div class="awards-one__title-box">
                                    <div class="awards-one__title-circle-box">
                                        <p>{{ award.initial }}</p>
                                    </div>
                                    <h3 class="awards-one__title" v-html="award.title"></h3>
                                </div>
                                <div class="awards-one__year">
                                    <p>{{ award.year }}</p>
                                </div>
                                <div class="awards-one__arrow">
                                    <router-link to="/about">
                                        <span class="icon-up-right-arrow-1"></span>
                                    </router-link>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-xl-5">
                    <div class="awards-one__right wow slideInRight" data-wow-delay="100ms" data-wow-duration="2500ms">
                        <div class="awards-one__img-box">
                            <div class="awards-one__img">
                                <img :src="image1" alt="">
                            </div>
                            <div class="awards-one__img-two">
                                <img :src="image2" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import image1 from '@/assets/images/resources/awards-one-img-1.jpg';
import image2 from '@/assets/images/resources/awards-one-img-2.jpg';

const awards = [
    {
        initial: 'W.',
        title: 'Boston Award For <br> Architecture',
        year: '2024',
        delay: '100ms'
    },
    {
        initial: 'W.',
        title: 'Boston Award For <br> Architecture',
        year: '2025',
        delay: '200ms'
    },
    {
        initial: 'W.',
        title: 'Boston Award For <br> Architecture',
        year: '2026',
        delay: '400ms'
    }
];
</script>
