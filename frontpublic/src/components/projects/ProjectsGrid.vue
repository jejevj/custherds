<template>
    <section class="projects-page">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <div v-for="(project, index) in projects" :key="index" class="col-xl-4 col-lg-4 col-md-6">
                    <div class="project-two__single">
                        <div class="project-two__img">
                            <img :src="project.image" :alt="project.title">
                        </div>
                        <div class="project-two__content">
                            <h3 class="project-two__title">
                                <router-link :to="project.link">{{ project.title }}</router-link>
                            </h3>
                            <div class="project-two__arrow">
                                <a :href="project.image" class="img-popup" @click.prevent="openPopup(index)">
                                    <span class="icon-up-right-arrow-1"></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Popup -->
        <ImagePopup v-model="isPopupOpen" v-model:initialIndex="popupIndex" :images="projects" />
    </section>
</template>

<script setup>
import { ref } from 'vue';
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import ImagePopup from '@/components/common/ImagePopup.vue';

const props = defineProps({
    projects: {
        type: Array,
        required: true
    }
});

const isPopupOpen = ref(false);
const popupIndex = ref(0);

const openPopup = (index) => {
    popupIndex.value = index;
    isPopupOpen.value = true;
};
</script>
