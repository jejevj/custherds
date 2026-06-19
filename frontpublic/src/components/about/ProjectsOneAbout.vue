<template>
    <section class="projects-one projects-four">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="projects-one__top">
            <div class="container">
                <div class="projects-one__top-inner">
                    <div class="section-title text-left sec-title-animation animation-style2">
                        <h2 class="section-title__title title-animation">We Elevate Your Brand's <br> Daring Dedication.</h2>
                    </div>
                    <div class="projects-one__filter-box">
                        <ul class="projects-one__filter style1 post-filter list-unstyled clearfix">
                            <li v-for="f in filters" :key="f.val"
                                :class="{ active: activeFilter === f.val }"
                                @click="activeFilter = f.val">
                                <span class="filter-text">{{ f.label }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="projects-one__bottom">
            <div class="container">
                <div class="row">
                    <transition-group name="filter-fade">
                        <div v-for="(project, index) in filteredProjects" :key="project.image + index"
                            class="col-xl-3 col-lg-6 col-md-6">
                            <div class="projects-one__single">
                                <div class="projects-one__img-box">
                                    <div class="projects-one__img"><img :src="project.image" alt=""></div>
                                    <div class="projects-one__content">
                                        <div class="projects-one__content-shape-1"
                                            :style="{ backgroundImage: 'url(' + contentShape + ')' }"></div>
                                        <h4 class="projects-one__title">
                                            <router-link to="/project-details">{{ project.title }}</router-link>
                                        </h4>
                                        <p class="projects-one__sub-title">{{ project.subtitle }}</p>
                                    </div>
                                    <div class="projects-one__arrow">
                                        <a :href="project.image" class="img-popup" @click.prevent="openPopup(index)">
                                            <span class="icon-up-right-arrow-1"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition-group>
                </div>
            </div>
        </div>

        <!-- Image Popup -->
        <ImagePopup v-model="isPopupOpen" v-model:initialIndex="popupIndex" :images="filteredProjects" />
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import contentShape from '@/assets/images/shapes/projects-one-content-shape-1.png';
import p1 from '@/assets/images/project/projects-1-1.jpg';
import p2 from '@/assets/images/project/projects-1-2.jpg';
import p3 from '@/assets/images/project/projects-1-3.jpg';
import p4 from '@/assets/images/project/projects-1-4.jpg';
import ImagePopup from '@/components/common/ImagePopup.vue';

export default {
    name: "ProjectsOneAbout",
    components: {
        ImagePopup
    },
    data() {
        return {
            sectionShape, contentShape,
            activeFilter: 'all',
            isPopupOpen: false,
            popupIndex: 0,
            filters: [
                { label: 'All',    val: 'all'  },
                { label: 'Design', val: 'des'  },
                { label: 'Anime',  val: 'ani'  },
                { label: 'Nature', val: 'nat'  },
                { label: 'Animal', val: 'anim' },
            ],
            projects: [
                { title: "Neoclassical Sofa",   subtitle: "Interior Design", image: p1, cats: ['des','nat','anim'] },
                { title: "Neoclassical Sofa",   subtitle: "Interior Design", image: p2, cats: ['anim','ani']       },
                { title: "Neoclassical Sofa",   subtitle: "Interior Design", image: p3, cats: ['des','ani']         },
                { title: "Neoclassical Sofa",   subtitle: "Interior Design", image: p4, cats: ['des','ani','nat']   },
            ]
        };
    },
    computed: {
        filteredProjects() {
            if (this.activeFilter === 'all') return this.projects;
            return this.projects.filter(p => p.cats.includes(this.activeFilter));
        }
    },
    methods: {
        openPopup(index) {
            this.popupIndex = index;
            this.isPopupOpen = true;
        }
    }
};
</script>

<style scoped>
.filter-fade-enter-active,
.filter-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.filter-fade-enter-from,
.filter-fade-leave-to     { opacity: 0; transform: scale(0.95); }
</style>
