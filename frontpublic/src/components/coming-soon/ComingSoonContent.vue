<template>
    <section class="coming-soon-page full-height">
        <div class="coming-soon-page__bg" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }"></div>
        <div class="coming-soon-page__content">
            <div class="inner">
                <div class="big-title">We're Coming Soon...</div>
                <div class="timer-box clearfix">
                    <ul class="countdown-timer list-unstyled">
                        <li>
                            <div class="box">
                                <span class="days">{{ String(days).padStart(2, '0') }}</span>
                                <span class="timeRef">Days</span>
                            </div>
                        </li>
                        <li>
                            <div class="box">
                                <span class="hours">{{ String(hours).padStart(2, '0') }}</span>
                                <span class="timeRef">HRS</span>
                            </div>
                        </li>
                        <li>
                            <div class="box">
                                <span class="minutes">{{ String(minutes).padStart(2, '0') }}</span>
                                <span class="timeRef">MINS</span>
                            </div>
                        </li>
                        <li>
                            <div class="box">
                                <span class="seconds">{{ String(seconds).padStart(2, '0') }}</span>
                                <span class="timeRef">SECS</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="text">
                    <p>
                        Website is under construction. We'll be here soon with new<br>
                        awesome site, Subscribe to be notified.
                    </p>
                </div>
                <div class="coming-soon-page__subscribe-box">
                    <form class="subscribe-form" @submit.prevent="handleSubscribe">
                        <input 
                            v-model="email" 
                            placeholder="Enter your email address" 
                            type="email" 
                            required
                        >
                        <button type="submit" class="thm-btn coming-soon-page__btn">
                            send massage <span class="icon-dubble-arrow-right"></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import backgroundImage from '@/assets/images/backgrounds/coming-soon-page-bg.jpg';

const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const email = ref('');
let interval = null;

const calculateTime = () => {
    const targetDate = new Date("2026-12-31T00:00:00").getTime(); // Set your target date here
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        clearInterval(interval);
        return;
    }

    days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000);
};

const handleSubscribe = () => {
    // Implement subscription logic
    console.log("Subscribed with email:", email.value);
    email.value = "";
};

onMounted(() => {
    calculateTime();
    interval = setInterval(calculateTime, 1000);
});

onUnmounted(() => {
    if (interval) clearInterval(interval);
});
</script>

<style scoped>
.full-height {
    min-height: 100vh;
    height: 100vh;
}
</style>
