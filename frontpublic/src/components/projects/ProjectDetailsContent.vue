<template>
    <section class="project-details">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="project-details__img">
                <img :src="mainImage" alt="">
            </div>
            <div class="project-details__content">
                <h3 class="project-details__title-1">{{ title }}</h3>
                <p class="project-details__text-1">{{ description1 }}</p>
                <p class="project-details__text-2">{{ description2 }}</p>

                <div class="project-details__img-and-faq">
                    <div class="row">
                        <div class="col-xl-6 col-lg-6">
                            <div class="project-details__img-box-img">
                                <img :src="sideImage" alt="">
                            </div>
                        </div>
                        <div class="col-xl-6 col-lg-6">
                            <div class="project-details__faq-box">
                                <div class="accrodion-grp faq-one-accrodion">
                                    <div
                                        v-for="(faq, index) in faqs"
                                        :key="index"
                                        class="accrodion"
                                        :class="{ active: index === 0 }"
                                    >
                                        <div class="accrodion-title" @click="toggle($event)">
                                            <h4>{{ faq.question }}</h4>
                                            <div class="project-details__faq-box-count"></div>
                                        </div>
                                        <div class="accrodion-content" :style="index === 0 ? '' : 'display:none'">
                                            <div class="inner"><p>{{ faq.answer }}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="project-details__text-3">{{ description3 }}</p>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

export default {
    name: "ProjectDetailsContent",
    props: {
        title:        { type: String, required: true },
        mainImage:    { type: String, required: true },
        sideImage:    { type: String, required: true },
        description1: { type: String, required: true },
        description2: { type: String, required: true },
        description3: { type: String, required: true },
        faqs:         { type: Array, required: true },
    },
    data() {
        return { sectionShape };
    },
    methods: {
        toggle(e) {
            const titleEl = e.currentTarget;
            const acc = titleEl.closest('.accrodion');
            const grp = titleEl.closest('.accrodion-grp');
            if (acc.classList.contains('active')) return;
            grp.querySelectorAll('.accrodion').forEach(a => {
                a.classList.remove('active');
                const c = a.querySelector('.accrodion-content');
                if (c) c.style.display = 'none';
            });
            acc.classList.add('active');
            const content = acc.querySelector('.accrodion-content');
            if (content) content.style.display = 'block';
        }
    }
};
</script>

<style scoped>
.accrodion-content {
    overflow: hidden;
    transition: all 0.4s ease-in-out;
}
.accrodion-title {
    cursor: pointer;
    transition: all 0.3s ease;
}
.accrodion.active .accrodion-title {
    transition: all 0.3s ease;
}
</style>
