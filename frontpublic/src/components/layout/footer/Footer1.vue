<template>
    <footer class="site-footer">
        <div class="site-footer__shape-1 float-bob-x">
            <img src="@/assets/images/shapes/site-footer-shape-1.png" alt="">
        </div>
        <div class="site-footer__shape-2 float-bob-y">
            <img src="@/assets/images/shapes/site-footer-shape-2.png" alt="">
        </div>

        <div class="site-footer__marquee">
            <div class="footer-marquee__track-wrapper">
                <ul class="marquee_mode footer-marquee__track">
                    <li v-for="(item, i) in loopedItems" :key="i">
                        {{ item }}
                    </li>
                </ul>
            </div>
        </div>

        <div class="container">
            <div class="site-footer__top">
                <div class="row">
                    <!-- About -->
                    <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="100ms">
                        <div class="footer-widget__column footer-widget__about">
                            <div class="footer-widget__logo">
                                <router-link to="/"><img src="@/assets/images/resources/footer-logo-1.png" alt="Custherds"></router-link>
                            </div>
                            <p class="footer-widget__about-text">Custherds connects affiliate partners with trusted business vendors — making it easy to earn, grow, and track your performance in one unified ecosystem.</p>
                            <div class="site-footer__social">
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                    <!-- Quick Links -->
                    <div class="col-xl-2 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="200ms">
                        <div class="footer-widget__column footer-widget__usefull-link">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Quick Links</h3>
                            </div>
                            <div class="footer-widget__link-box">
                                <ul class="footer-widget__link list-unstyled">
                                    <li><router-link to="/">Home</router-link></li>
                                    <li><router-link to="/about">About Us</router-link></li>
                                    <li><router-link to="/contact">Contact Us</router-link></li>
                                    <li><router-link to="/faq">FAQ</router-link></li>
                                    <li><router-link to="/terms">Terms &amp; Conditions</router-link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!-- Register -->
                    <div class="col-xl-2 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="300ms">
                        <div class="footer-widget__column footer-widget__services">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Register</h3>
                            </div>
                            <ul class="footer-widget__link list-unstyled">
                                <li><router-link to="/register">Herd Partners</router-link></li>
                                <li><router-link to="/register">Business Vendor</router-link></li>
                            </ul>
                        </div>
                    </div>
                    <!-- Contact -->
                    <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="400ms">
                        <div class="footer-widget__column">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Get in Touch</h3>
                            </div>
                            <ul class="footer-widget__link list-unstyled">
                                <li><i class="icon-pin" style="margin-right:8px"></i> Bali, Indonesia</li>
                                <li><i class="icon-telephone" style="margin-right:8px"></i> <a href="tel:+6287761081555">+62877 6108 1555</a></li>
                                <li><i class="icon-envelope" style="margin-right:8px"></i> <a href="mailto:team@custherds.com">team@custherds.com</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="site-footer__bottom">
            <div class="container">
                <div class="site-footer__bottom-inner">
                    <p class="site-footer__bottom-text">&copy; 2025&#8211;2026 <router-link to="/">Custherds.</router-link> | All rights reserved</p>
                    <ul class="list-unstyled site-footer__bottom-menu">
                        <li><router-link to="/terms">Terms &amp; Conditions</router-link></li>
                        <li><router-link to="/faq">FAQ</router-link></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: "Footer1",
    data() {
        return {
            items: [
                'Turn Your Network into Net Worth',
                'Herd Your Networks to Trusted Vendors',
                'Earn Commission After Service Completion',
                'Grow Beyond Boundaries',
            ]
        };
    },
    computed: {
        loopedItems() {
            return [...this.items, ...this.items, ...this.items, ...this.items];
        }
    }
};
</script>

<style scoped>
.footer-marquee__track {
    display: flex !important;
    align-items: center;
    flex-wrap: nowrap;
    width: max-content !important;
    animation: footerMarqueeSlide 30s linear infinite !important;
    margin: 0;
    padding: 0;
}

.footer-marquee__track:hover {
    animation-play-state: paused !important;
}

.footer-marquee__track li {
    display: inline-flex !important;
    align-items: center;
    flex-shrink: 0;
    margin-right: 50px;
    margin-left: 0 !important;
    float: none !important;
    animation: none !important;
}

@keyframes footerMarqueeSlide {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-25%); }
}
</style>
