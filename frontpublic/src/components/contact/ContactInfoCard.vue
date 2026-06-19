<template>
    <div class="single-contact-info-section">
        <div class="icon">
            <i :class="icon"></i>
        </div>
        <div class="single-contact-info-section__content">
            <div class="text">
                <h3>{{ title }}</h3>
                <p v-if="subtitle">{{ subtitle }}</p>
                <p v-if="type === 'phone'">
                    <a :href="'tel:' + link">{{ contact }}</a>
                </p>
                <p v-else-if="type === 'email'">
                    <a :href="'mailto:' + link">{{ contact }}</a>
                </p>
                <p v-else>{{ contact }}</p>
            </div>
            <div class="btn-box">
                <a href="#">
                    {{ buttonText }}
                    <span class="icon-up-right-arrow"></span>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    contact: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text' // text, phone, email
    },
    buttonText: {
        type: String,
        default: 'Get Call Back'
    }
});
</script>
