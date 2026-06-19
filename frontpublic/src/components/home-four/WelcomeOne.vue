<template>
    <section class="welcome-style1">
        <div class="container">
            <div class="section-title sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Welcome to Interior</h2>
            </div>
            <div class="row">
                <div class="col-xl-6">
                    <div class="welcome-style1__content">
                        <div class="title">
                            <h3> We are the best Interior designer since 1975.</h3>
                        </div>
                        <div class="text">
                            <p>Interior brings 41 years of interior designs experience right to your home or office.
                                Our design professionals are equipped to help you determine the products and design
                                that work best for our customers within the colors and lighting of your surroundings
                                more than your expectation.</p>
                            <p>
                                Since our meetings take place in your home or office, we’ll work with you to help
                                visualize a design solution that aligns with your taste, space, and budget, Also our
                                team will guide you.
                            </p>
                        </div>
                        <div class="bottom-box">
                            <div class="btn-box">
                                <router-link to="/about" class="thm-btn">More About Us <span
                                        class="icon-up-right-arrow"></span> </router-link>
                            </div>
                            <div class="mail-box">
                                <h3>
                                    Request Quote: <br><a href="mailto:freequote@gmail.com">freequote@gmail.com</a>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="welcome-style1__img">
                        <div class="row">
                            <div class="col-xl-6">
                                <div class="img2">
                                    <img src="@/assets/images/resources/welcome-1-2.jpg" alt="image">
                                </div>
                            </div>
                            <div class="col-xl-6">
                                <div class="img1">
                                    <img src="@/assets/images/resources/welcome-1-1.jpg" alt="image">
                                    <div class="video-btn">
                                        <a class="video-popup" title="Video Gallery"
                                            @click.prevent="openVideo"
                                            href="https://www.youtube.com/watch?v=8bZDBFHsyXw">
                                            <span class="fa fa-play"></span>
                                            <i class="ripple"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <VideoPopup v-model="isPopupOpen" :videoUrl="videoUrl" />
</template>

<script setup>
import { ref } from 'vue';
import VideoPopup from '@/components/common/VideoPopup.vue';

const isPopupOpen = ref(false);
const videoUrl = ref('https://www.youtube.com/watch?v=8bZDBFHsyXw');

const openVideo = (e) => {
    isPopupOpen.value = true;
};
</script>

