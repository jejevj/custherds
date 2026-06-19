<template>
    <div>
        <header class="main-header">
            <nav class="main-menu">
                <div class="main-menu__wrapper">
                    <div class="container">
                        <div class="main-menu__wrapper-inner">
                            <div class="main-menu__logo">
                                <div class="section-shape-1"
                                    style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
                                <router-link to="/"><img src="@/assets/images/resources/logo-1.png" alt=""></router-link>
                            </div>
                            <div class="main-menu__top">
                                <div class="main-menu__top-inner">
                                    <ul class="list-unstyled main-menu__contact-list">
                                        <li>
                                            <div class="icon">
                                                <i class="icon-telephone"></i>
                                            </div>
                                            <div class="text">
                                                <p><a href="tel:15502505260">+1 (550) 250 5260</a></p>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="icon">
                                                <i class="icon-envelope-2"></i>
                                            </div>
                                            <div class="text">
                                                <p><a href="mailto:info@tecture.com">info@tecture.com</a>
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <div class="main-menu__top-right">
                                        <div class="main-menu__top-time">
                                            <div class="main-menu__top-time-icon">
                                                <span class="far fa-clock"></span>
                                            </div>
                                            <p class="main-menu__top-text">Mon - Fri: 09:00 - 05:00</p>
                                        </div>
                                        <div class="main-menu__social">
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fab fa-facebook"></i></a>
                                            <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                            <a href="#"><i class="fab fa-instagram"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="main-menu__bottom">
                                <div class="main-menu__main-menu-box">
                                    <a href="#" class="mobile-nav__toggler"><i class="fa fa-bars"></i></a>
                                    <NavLinks />
                                </div>

                                <div class="main-menu__search-and-btn-box">
                                    <div class="main-menu__search-box">
                                        <a href="#"
                                            class="main-menu__search search-toggler icon-search-interface-symbol">
                                        </a>
                                    </div>
                                    <div class="main-menu__btn-box">
                                        <router-link to="/contact" class="thm-btn main-menu__btn">
                                            Free Quota <span class="icon-up-right-arrow"></span>
                                        </router-link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>

        <transition name="sticky">
            <div v-show="isSticky" class="stricky-header stricked-menu main-menu stricky-fixed">
                <div class="sticky-header__content">
                    <nav class="main-menu">
                        <div class="main-menu__wrapper">
                            <div class="container">
                                <div class="main-menu__wrapper-inner">
                                    <div class="main-menu__logo">
                                        <router-link to="/"><img src="@/assets/images/resources/logo-1.png" alt=""></router-link>
                                    </div>
                                    <div class="main-menu__bottom">
                                        <div class="main-menu__main-menu-box">
                                            <NavLinks />
                                        </div>
                                        <div class="main-menu__search-and-btn-box">
                                            <div class="main-menu__search-box">
                                                <a href="#" class="main-menu__search search-toggler icon-search-interface-symbol"></a>
                                            </div>
                                            <div class="main-menu__btn-box">
                                                <router-link to="/contact" class="thm-btn main-menu__btn">
                                                    Free Quota <span class="icon-up-right-arrow"></span>
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import NavLinks from './NavLinks.vue';
import { headerMixin } from '@/mixins/headerMixin';

export default {
    name: "HeaderOne",
    components: {
        NavLinks
    },
    mixins: [headerMixin]
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

/* Ensure the sticky header content transition is smooth */
.stricky-header {
    transition: transform 0.4s ease;
    z-index: 999 !important;
}

.navSidebar-button {
    font-size: 20px;
    color: var(--tecture-black);
    transition: all 500ms ease;
}

.navSidebar-button .icon-text:before {
    content: "\e919";
    font-family: 'tecture' !important;
}
</style>
