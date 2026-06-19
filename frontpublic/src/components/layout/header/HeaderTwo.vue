<template>
    <div>
        <header class="main-header-two">
            <div class="section-shape-1"
                :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
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
                                <a href="#" class="mobile-nav__toggler"><i class="fa fa-bars"></i></a>
                                <NavLinks />
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

        <transition name="sticky">
            <div v-show="isSticky" class="stricky-header stricked-menu main-menu main-menu-two stricky-fixed">
                <div class="sticky-header__content">
                    <nav class="main-menu main-menu-two">
                        <div class="main-menu-two__wrapper">
                            <div class="main-menu-two__wrapper-inner">
                                <div class="main-menu-two__logo">
                                    <router-link to="/"><img src="@/assets/images/resources/logo-1.png" alt=""></router-link>
                                </div>
                                <div class="main-menu-two__right">
                                    <div class="main-menu-two__main-menu-box">
                                        <NavLinks />
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
                </div><!-- /.sticky-header__content -->
            </div><!-- /.stricky-header -->
        </transition>
    </div>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import NavLinks from './NavLinks.vue';
import { headerMixin } from '@/mixins/headerMixin';

export default {
    name: "HeaderTwo",
    components: {
        NavLinks
    },
    mixins: [headerMixin],
    data() {
        return {
            sectionShape
        }
    }
};
</script>

<style scoped>
.sticky-enter-active,
.sticky-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.sticky-enter-from,
.sticky-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.stricky-header {
    transition: transform 0.4s ease;
    z-index: 999 !important;
}
</style>
