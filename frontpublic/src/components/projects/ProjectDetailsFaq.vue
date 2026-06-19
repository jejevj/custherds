<template>
    <div class="project-details__faq-box">
        <div class="accrodion-grp">
            <div 
                v-for="(faq, index) in faqs" 
                :key="index" 
                class="accrodion"
                :class="{ active: activeIndex === index }"
            >
                <div class="accrodion-title" @click="toggleAccordion(index)">
                    <h4>{{ faq.question }}</h4>
                    <div class="project-details__faq-box-count"></div>
                </div>
                <transition
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
                    @after-leave="afterLeave"
                >
                    <div class="accrodion-content" v-show="activeIndex === index">
                        <div class="inner">
                            <p>{{ faq.answer }}</p>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    faqs: {
        type: Array,
        required: true
    }
});

const activeIndex = ref(0);

const toggleAccordion = (index) => {
    activeIndex.value = activeIndex.value === index ? null : index;
};

const beforeEnter = (el) => {
    el.style.display = 'block';
    const height = el.offsetHeight;
    el.style.height = '0px';
    el.style.paddingTop = '0px';
    el.style.paddingBottom = '0px';
    el.style.marginTop = '0px';
    el.style.marginBottom = '0px';
    el.style.overflow = 'hidden';
    el.dataset.height = height;
};

const enter = (el, done) => {
    el.offsetHeight; // Force reflow
    el.style.transition = 'all 0.4s ease-in-out';
    el.style.height = el.dataset.height + 'px';
    el.style.removeProperty('padding-top');
    el.style.removeProperty('padding-bottom');
    el.style.removeProperty('margin-top');
    el.style.removeProperty('margin-bottom');
    setTimeout(done, 400);
};

const afterEnter = (el) => {
    el.style.removeProperty('height');
    el.style.removeProperty('overflow');
    el.style.removeProperty('transition');
};

const beforeLeave = (el) => {
    el.style.height = el.offsetHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.transition = 'all 0.4s ease-in-out';
};

const leave = (el, done) => {
    el.offsetHeight; // Force reflow
    el.style.height = '0px';
    el.style.paddingTop = '0px';
    el.style.paddingBottom = '0px';
    el.style.marginTop = '0px';
    el.style.marginBottom = '0px';
    setTimeout(done, 400);
};

const afterLeave = (el) => {
    el.style.removeProperty('height');
    el.style.removeProperty('padding-top');
    el.style.removeProperty('padding-bottom');
    el.style.removeProperty('margin-top');
    el.style.removeProperty('margin-bottom');
    el.style.removeProperty('overflow');
    el.style.removeProperty('transition');
};
</script>

<style scoped>
.accrodion-title {
    cursor: pointer;
    transition: all 0.3s ease;
}
</style>
