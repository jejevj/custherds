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
                    <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="100ms">
                        <div class="footer-widget__column footer-widget__about">
                            <div class="footer-widget__logo">
                                <router-link to="/"><img src="@/assets/images/resources/footer-logo-1.png"
                                        alt=""></router-link>
                            </div>
                            <p class="footer-widget__about-text">Eros vivamus platea nullam id consequat eu sociis
                                lectus aliquam nibh auctor elitsed libero pharetra consequat and fad sociis conubia
                                favorite to risus.</p>
                            <div class="site-footer__social">
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="200ms">
                        <div class="footer-widget__column footer-widget__usefull-link">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Useful Links</h3>
                            </div>
                            <div class="footer-widget__link-box">
                                <ul class="footer-widget__link list-unstyled">
                                    <li><router-link to="/contact">Our Support</router-link></li>
                                    <li><router-link to="/about">System Status</router-link></li>
                                    <li><router-link to="/about">Knowledge base</router-link></li>
                                    <li><router-link to="/blog">Blog</router-link></li>
                                    <li><router-link to="/contact">Contact us</router-link></li>
                                    <li><router-link to="/contact">Write For Us</router-link></li>
                                </ul>
                                <ul class="footer-widget__link footer-widget__link-2 list-unstyled">
                                    <li><router-link to="/about">Ebooks</router-link></li>
                                    <li><router-link to="/about">Cloudways Users</router-link></li>
                                    <li><router-link to="/about">Group</router-link></li>
                                    <li><router-link to="/about">Customer Voice</router-link></li>
                                    <li><router-link to="/about">Properties Right</router-link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="300ms">
                        <div class="footer-widget__column footer-widget__services">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Our Services</h3>
                            </div>
                            <ul class="footer-widget__link list-unstyled">
                                <li><router-link to="/harmony-interiors">Harmony Interiors</router-link></li>
                                <li><router-link to="/about">Amman Rotane Hotel</router-link></li>
                                <li><router-link to="/about">European Lard Sration</router-link></li>
                                <li><router-link to="/evolve-space-designs">Evolve Space Designs</router-link></li>
                                <li><router-link to="/eden-home-styling">Eden Home Styling</router-link></li>
                                <li><router-link to="/interior-design">Interior Design </router-link></li>
                                <li><router-link to="/urban-design">Human Resources</router-link></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="400ms">
                        <div class="footer-widget__column footer-widget__instagram">
                            <div class="footer-widget__title-box">
                                <h3 class="footer-widget__title">Instagram</h3>
                            </div>
                            <ul class="footer-widget__instagram-list list-unstyled clearfix">
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-1.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-2.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-3.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-4.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-5.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                                <li>
                                    <div class="footer-widget__instagram-img">
                                        <img src="@/assets/images/resources/footer-widget-instagram-img-6.jpg" alt="">
                                        <a href="#"><span class="fab fa-instagram"></span></a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="site-footer__bottom">
            <div class="container">
                <div class="site-footer__bottom-inner">
                    <p class="site-footer__bottom-text">© 2026
                        Copyright <a href="#">Tecture.</a> | All rights reserved</p>
                    <ul class="list-unstyled site-footer__bottom-menu">
                        <li><router-link to="/about">Privacy & Policy</router-link></li>
                        <li><router-link to="/about">Terms of use</router-link></li>
                        <li><router-link to="/about">Cookie Policy</router-link></li>
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
                'Interior Design',
                'luxury homes',
                'construction simulator'
            ]
        };
    },
    computed: {
        // Duplicate items 4× so the track is wide enough for seamless looping
        loopedItems() {
            return [...this.items, ...this.items, ...this.items, ...this.items];
        }
    }
};
</script>

<style scoped>
.footer-marquee__track {
    display: flex !important; /* Override public CSS */
    align-items: center;
    flex-wrap: nowrap;
    width: max-content !important; /* Override public CSS */
    animation: footerMarqueeSlide 30s linear infinite !important; /* Override public CSS */
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
    margin-left: 0 !important; /* Reset faulty left margin */
    float: none !important;    /* Block float layout breakage */
    animation: none !important; /* Cancel the messy public CSS li animation */
}

@keyframes footerMarqueeSlide {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-25%); } /* 4 sets, so we move exactly 1 set (25%) */
}
</style>
