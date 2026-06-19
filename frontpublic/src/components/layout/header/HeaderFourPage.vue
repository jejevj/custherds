<template>
    <div>
        <header class="main-header-two">
            <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
            <nav class="main-menu main-menu-two">
                <div class="main-menu-two__wrapper">
                    <div class="main-menu-two__wrapper-inner">
                        <div class="main-menu-two__left">
                            <div class="main-menu-two__logo">
                                <router-link to="/">
                                    <img src="@/assets/images/resources/logo-1.png" alt="">
                                </router-link>
                            </div>
                        </div>
                        <div class="main-menu-two__right">
                            <div class="main-menu-two__main-menu-box">
                                <a href="#" class="mobile-nav__toggler" @click.prevent="openMobileNav"><i class="fa fa-bars"></i></a>
                                <ul class="main-menu__list one-page-scroll-menu">
                                    <li v-for="item in menuItems" :key="item.id" :class="['scrollToLink', { current: activeSection === item.id }]">
                                        <a :href="'#' + item.id" @click.prevent="scrollTo(item.id)">{{ item.name }}</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="main-menu-two__search-and-nav-sidebar-icon">
                                <a href="#" class="main-menu-two__search search-toggler"><span
                                        class="icon-search-interface-symbol"></span></a>
                                <div class="main-menu-two__nav-sidebar-icon">
                                    <a class="navSidebar-button" href="#">
                                        <span class="icon-text"></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>

        <!-- Pure Vue Sticky Header -->
        <transition name="sticky-fade">
            <div v-show="isSticky" class="stricky-header stricked-menu main-menu main-menu-two stricky-fixed">
                <div class="sticky-header__content">
                    <div class="main-menu-two__wrapper-inner">
                        <div class="main-menu-two__left">
                            <div class="main-menu-two__logo">
                                <router-link to="/">
                                    <img src="@/assets/images/resources/logo-1.png" alt="">
                                </router-link>
                            </div>
                        </div>
                        <div class="main-menu-two__right">
                            <div class="main-menu-two__main-menu-box">
                                <ul class="main-menu__list one-page-scroll-menu">
                                    <li v-for="item in menuItems" :key="'sticky-' + item.id" :class="['scrollToLink', { current: activeSection === item.id }]">
                                        <a :href="'#' + item.id" @click.prevent="scrollTo(item.id)">{{ item.name }}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import { headerMixin } from '@/mixins/headerMixin';

export default {
    name: "HeaderFourPage",
    mixins: [headerMixin],
    data() {
        return {
            sectionShape,
            activeSection: 'home',
            menuItems: [
                { id: 'home',        name: 'Home' },
                { id: 'about',       name: 'About Us' },
                { id: 'services',    name: 'Services' },
                { id: 'testimonial', name: 'Testimonials' },
                { id: 'blog',        name: 'Blog' },
                { id: 'contact',     name: 'Contact' }
            ]
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener("scroll", this.onScrollSpy, { passive: true });
            this.onScrollSpy();
        });
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.onScrollSpy);
    },
    methods: {
        onScrollSpy() {
            const SPY_OFFSET = 150;
            let currentId = 'home';
            
            this.menuItems.forEach(item => {
                const section = document.getElementById(item.id);
                if (section && (section.getBoundingClientRect().top + window.scrollY - SPY_OFFSET <= window.scrollY)) {
                    currentId = item.id;
                }
            });
            this.activeSection = currentId;
        },
        scrollTo(id) {
            const target = document.getElementById(id);
            if (!target) return;
            const OFFSET = 100;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - OFFSET + 1,
                behavior: "smooth"
            });
            this.activeSection = id;
        },
        openMobileNav() {
            // Trigger global mobile nav
        }
    }
};
</script>

<style scoped>
.sticky-fade-enter-active,
.sticky-fade-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.sticky-fade-enter-from,
.sticky-fade-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.stricky-header {
    z-index: 1000 !important;
}

.main-menu-two__wrapper-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>

