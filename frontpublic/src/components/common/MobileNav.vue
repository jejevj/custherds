<template>
    <div class="mobile-nav__wrapper" :class="{ expanded: isExpanded }">
        <div class="mobile-nav__overlay" @click="closeMenu"></div>
        <!-- /.mobile-nav__overlay -->
        <div class="mobile-nav__content">
            <span class="mobile-nav__close" @click="closeMenu"><i class="fa fa-times"></i></span>

            <div class="logo-box">
                <router-link to="/" aria-label="logo image" @click="closeMenu">
                    <img src="@/assets/images/resources/logo-4.png" width="150" alt="" />
                </router-link>
            </div>
            <!-- /.logo-box -->
            <div class="mobile-nav__container">
                <NavLinks ulClass="main-menu__list" @close="closeMenu" />
            </div>
            <!-- /.mobile-nav__container -->

            <ul class="mobile-nav__contact list-unstyled">
                <li>
                    <i class="fa fa-envelope"></i>
                    <a href="mailto:info@tecture.com">info@tecture.com</a>
                </li>
                <li>
                    <i class="fa fa-phone-alt"></i>
                    <a href="tel:6668880000">666 888 0000</a>
                </li>
            </ul><!-- /.mobile-nav__contact -->
            <div class="mobile-nav__top">
                <div class="mobile-nav__social">
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-facebook-square"></a>
                    <a href="#" class="fab fa-pinterest-p"></a>
                    <a href="#" class="fab fa-instagram"></a>
                </div><!-- /.mobile-nav__social -->
            </div><!-- /.mobile-nav__top -->
        </div>
        <!-- /.mobile-nav__content -->
    </div>
</template>

<script>
import NavLinks from '../layout/header/NavLinks.vue';

export default {
    name: "MobileNav",
    components: {
        NavLinks
    },
    data() {
        return {
            isExpanded: false
        };
    },
    methods: {
        openMenu() {
            this.isExpanded = true;
            document.body.classList.add("locked");
        },
        closeMenu() {
            this.isExpanded = false;
            document.body.classList.remove("locked");
        },
        toggleMenu() {
            if (this.isExpanded) this.closeMenu();
            else this.openMenu();
        }
    },
    mounted() {
        // Shared toggle handler
        this._onToggle = (e) => {
            if (e.target.closest(".mobile-nav__toggler")) {
                e.preventDefault();
                this.toggleMenu();
            }
        };
        document.addEventListener("click", this._onToggle);
    },
    beforeUnmount() {
        document.removeEventListener("click", this._onToggle);
        document.body.classList.remove("locked");
    }
};
</script>
