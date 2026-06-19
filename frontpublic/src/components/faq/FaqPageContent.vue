<template>
    <section class="faq-page">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <div class="col-xl-6 col-lg-6">
                    <div class="faq-page__left">
                        <div class="project-details__faq-box">
                            <div class="accrodion-grp faq-one-accrodion">
                                <div v-for="(faq, index) in faqsLeft" :key="'l-' + index"
                                     class="accrodion" :class="{ active: activeLeft === index }">
                                    <div class="accrodion-title" @click="toggleLeft(index)">
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
                                        <div class="accrodion-content" v-show="activeLeft === index">
                                            <div class="inner"><p>{{ faq.answer }}</p></div>
                                        </div>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6">
                    <div class="faq-page__right">
                        <div class="project-details__faq-box">
                            <div class="accrodion-grp faq-one-accrodion">
                                <div v-for="(faq, index) in faqsRight" :key="'r-' + index"
                                     class="accrodion" :class="{ active: activeRight === index }">
                                    <div class="accrodion-title" @click="toggleRight(index)">
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
                                        <div class="accrodion-content" v-show="activeRight === index">
                                            <div class="inner"><p>{{ faq.answer }}</p></div>
                                        </div>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

const FAQ_ANSWER = 'The time it takes to repair a roof depends on the extent of the damage. For minor repairs, it might take an hour or two. For significant repairs, A team might be at your home for half a day.';

export default {
    name: "FaqPageContent",
    data() {
        return {
            sectionShape,
            activeLeft: 0,
            activeRight: 0,
            faqsLeft: [
                { question: 'What is the latest technology trend in the ?',  answer: FAQ_ANSWER },
                { question: 'How to Create my Project in Company?',          answer: FAQ_ANSWER },
                { question: 'How can IT services benefit my business?',      answer: FAQ_ANSWER },
                { question: 'What warranties do I have for installation?',   answer: FAQ_ANSWER },
            ],
            faqsRight: [
                { question: 'What is the latest technology trend in the ?',  answer: FAQ_ANSWER },
                { question: 'How to Create my Project in Company?',          answer: FAQ_ANSWER },
                { question: 'How can IT services benefit my business?',      answer: FAQ_ANSWER },
                { question: 'What warranties do I have for installation?',   answer: FAQ_ANSWER },
            ]
        };
    },
    methods: {
        toggleLeft(index) {
            this.activeLeft = this.activeLeft === index ? null : index;
        },
        toggleRight(index) {
            this.activeRight = this.activeRight === index ? null : index;
        },
        beforeEnter(el) {
            el.style.display = 'block';
            const height = el.offsetHeight;
            el.style.height = '0px';
            el.style.paddingTop = '0px';
            el.style.paddingBottom = '0px';
            el.style.marginTop = '0px';
            el.style.marginBottom = '0px';
            el.style.overflow = 'hidden';
            el.dataset.height = height;
        },
        enter(el, done) {
            el.offsetHeight; // Force reflow
            el.style.transition = 'all 0.4s ease-in-out';
            el.style.height = el.dataset.height + 'px';
            el.style.removeProperty('padding-top');
            el.style.removeProperty('padding-bottom');
            el.style.removeProperty('margin-top');
            el.style.removeProperty('margin-bottom');
            setTimeout(done, 400);
        },
        afterEnter(el) {
            el.style.removeProperty('height');
            el.style.removeProperty('overflow');
            el.style.removeProperty('transition');
        },
        beforeLeave(el) {
            el.style.height = el.offsetHeight + 'px';
            el.style.overflow = 'hidden';
            el.style.transition = 'all 0.4s ease-in-out';
        },
        leave(el, done) {
            el.offsetHeight; // Force reflow
            el.style.height = '0px';
            el.style.paddingTop = '0px';
            el.style.paddingBottom = '0px';
            el.style.marginTop = '0px';
            el.style.marginBottom = '0px';
            setTimeout(done, 400);
        },
        afterLeave(el) {
            el.style.removeProperty('height');
            el.style.removeProperty('padding-top');
            el.style.removeProperty('padding-bottom');
            el.style.removeProperty('margin-top');
            el.style.removeProperty('margin-bottom');
            el.style.removeProperty('overflow');
            el.style.removeProperty('transition');
        }
    }
};
</script>

<style scoped>
.accrodion-title {
    cursor: pointer;
    transition: all 0.3s ease;
}
</style>
