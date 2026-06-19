<template>
  <section class="projects-one">
    <div class="section-shape-1" style="background-image: url(/assets/images/shapes/section-shape-1.png);"></div>

    <div class="projects-one__top">
      <div class="container">
        <div class="projects-one__top-inner">
          <div class="section-title text-left sec-title-animation animation-style2">
            <h2 class="section-title__title title-animation">
              We Elevate Your Brand's <br> Daring Dedication.
            </h2>
          </div>
          <div class="projects-one__filter-box">
            <ul class="projects-one__filter style1 post-filter list-unstyled clearfix">
              <li
                v-for="(filter, index) in filters"
                :key="index"
                :data-filter="filter.dataFilter"
                :class="{ active: activeFilter === filter.dataFilter }"
                @click="setFilter(filter.dataFilter)"
              >
                <span class="filter-text">{{ filter.name }}</span>
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
            <div
              v-for="(project, index) in filteredProjects"
              :key="project.image + index"
              class="col-xl-3 col-lg-6 col-md-6"
            >
              <div class="projects-one__single">
                <div class="projects-one__img-box">
                  <div class="projects-one__img">
                    <img :src="project.image" :alt="project.title" />
                  </div>
                  <div class="projects-one__content">
                    <div class="projects-one__content-shape-1"
                      style="background-image: url(/assets/images/shapes/projects-one-content-shape-1.png);">
                    </div>
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
import ImagePopup from '@/components/common/ImagePopup.vue';

export default {
  name: "ProjectsOne",
  components: {
    ImagePopup
  },
  data() {
    return {
      activeFilter: ".filter-item",
      isPopupOpen: false,
      popupIndex: 0,
      filters: [
        { name: "All",    dataFilter: ".filter-item" },
        { name: "Design", dataFilter: ".des" },
        { name: "Anime",  dataFilter: ".ani" },
        { name: "Nature", dataFilter: ".nat" },
        { name: "Animal", dataFilter: ".anim" },
      ],
      projects: [
        { image: "/assets/images/project/projects-1-1.jpg", title: "Neoclassical Sofa",   subtitle: "Interior Design", categories: ["filter-item","des","nat","anim"] },
        { image: "/assets/images/project/projects-1-2.jpg", title: "Living Room Interior",subtitle: "Interior Design", categories: ["filter-item","anim","ani"]       },
        { image: "/assets/images/project/projects-1-3.jpg", title: "Living Remodeling",   subtitle: "Building",        categories: ["filter-item","des","ani"]         },
        { image: "/assets/images/project/projects-1-4.jpg", title: "Restaurant Interior", subtitle: "Architecture",    categories: ["filter-item","des","ani","nat"]   },
      ],
    };
  },
  computed: {
    filteredProjects() {
      if (this.activeFilter === ".filter-item") return this.projects;
      const cls = this.activeFilter.replace(".", "");
      return this.projects.filter(p => p.categories.includes(cls));
    }
  },
  methods: {
    setFilter(filterVal) {
      this.activeFilter = filterVal;
    },
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
