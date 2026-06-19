<template>
    <footer class="site-footer">
        <div class="site-footer__shape-1 float-bob-x">
            <img src="@/assets/images/shapes/site-footer-shape-1.png" alt="">
        </div>
        <div class="site-footer__shape-2 float-bob-y">
            <img src="@/assets/images/shapes/site-footer-shape-2.png" alt="">
        </div>

        <div class="site-footer__marquee site-footer-three__marquee-wrap">
            <div class="site-footer-three__marquee">
                <!-- Original List -->
                <ul class="site-footer__list">
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
                </ul>
                <!-- Cloned List for Infinite Loop -->
                <ul class="site-footer__list" aria-hidden="true">
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
                    <li>Interior Design</li>
                    <li>luxury homes</li>
                    <li>construction simulator</li>
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

<style scoped>
.site-footer-three__marquee-wrap {
    overflow: hidden;
    position: relative;
    width: 100%;
}

.site-footer-three__marquee {
    display: flex;
    width: fit-content;
    animation: scrollMarquee 80s linear infinite;
}

.site-footer-three__marquee:hover {
    animation-play-state: paused;
}

.site-footer__list {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin: 0;
    padding: 0;
}

.site-footer__list li {
    flex-shrink: 0;
    white-space: nowrap;
    margin-left: 60px;
    color: rgba(var(--tecture-white-rgb), .05);
    font-size: 100px;
    line-height: 1.0em;
    font-family: var(--thm-font-2);
    font-weight: 700;
    text-transform: uppercase;
}

@keyframes scrollMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
</style>

