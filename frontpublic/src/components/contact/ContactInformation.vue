<template>
    <div class="contact-page__left">
        <div class="contact-page__information">
            <h3 class="contact-page__information-title">Contact Informatlon</h3>
            <ul class="contact-page__information-list list-unstyled">
                <li v-for="(item, index) in contactInfo" :key="index">
                    <div class="icon">
                        <span :class="item.icon"></span>
                    </div>
                    <div class="content">
                        <h3>{{ item.title }}</h3>
                        <p v-if="item.type === 'phone'">
                            <a :href="'tel:' + item.value">{{ item.text }}</a>
                        </p>
                        <p v-else-if="item.type === 'email'">
                            <a :href="'mailto:' + item.value">{{ item.text }}</a>
                        </p>
                        <p v-else>{{ item.text }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
defineProps({
    contactInfo: {
        type: Array,
        required: true
    }
});
</script>
