<template>
    <div class="service-details__left">
        <div class="service-details__service-box">
            <ul class="service-details__services-list list-unstyled">
                <li v-for="(service, index) in services" :key="index"
                    :class="{ active: activeService === service.slug }">
                    <router-link :to="service.link">
                        {{ service.title }}<span class="icon-right"></span>
                    </router-link>
                </li>
            </ul>
        </div>
        <div class="service-details__contact-box">
            <h3 class="service-details__title">Contact withus for any advice</h3>
            <div class="service-details__icon">
                <span class="icon-telephone"></span>
            </div>
            <p class="service-details__text">Need help? Talk to an expert</p>
            <p class="service-details__number">
                <a href="tel:892123119999">+892 12311 9999</a>
            </p>
        </div>
        <div class="service-details__download-box">
            <div class="icon">
                <span class="icon-download"></span>
            </div>
            <a href="#">Download PDF File</a>
        </div>
    </div>
</template>

<script setup>
defineProps({
    activeService: {
        type: String,
        default: 'evolve-space-designs'
    }
});

const services = [
    {
        title: 'Evolve Space Designs',
        link: '/evolve-space-designs',
        slug: 'evolve-space-designs'
    },
    {
        title: 'Eden Home Styling',
        link: '/eden-home-styling',
        slug: 'eden-home-styling'
    },
    {
        title: 'Harmony Interiors',
        link: '/harmony-interiors',
        slug: 'harmony-interiors'
    },
    {
        title: 'Interior Design',
        link: '/interior-design',
        slug: 'interior-design'
    },
    {
        title: 'Urban Design',
        link: '/urban-design',
        slug: 'urban-design'
    },
    {
        title: 'Landscape Design',
        link: '/landscape-design',
        slug: 'landscape-design'
    }
];
</script>
