<template>
    <footer class="site-footer-two">
        <div class="site-footer-two__top">
            <div class="container">
                <div class="site-footer-two__top-inner">
                    <div class="footer-widget__logo-two">
                        <router-link to="/">
                            <img src="@/assets/images/resources/footer-logo-1.png" alt="Logo">
                        </router-link>
                    </div>
                    <div class="site-footer__top-title-box">
                        <h3>Let's work together just drop me a line -
                            <a href="mailto:info@example.com">info@example.com</a>
                        </h3>
                    </div>
                    <div class="site-footer__social-two">
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-pinterest-p"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>

                </div>
            </div>
        </div>

        <div class="site-footer-two__main">
            <div class="site-footer-two__main-shape"
                :style="{ backgroundImage: 'url(' + footerShape + ')' }"></div>
            <div class="container">
                <div class="row">

                    <div class="col-xl-3">
                        <div class="footer-widget__column-two">
                            <div class="title-box">
                                <h3>About Company</h3>
                            </div>
                            <div class="footer-widget__column-two-about">
                                <div class="text">
                                    <p>
                                        Lorem ipsum dolor sit amet, consect etur adi pisicing elit sed do eiusmod.
                                    </p>
                                </div>
                                <ul class="footer-widget__column-two-about-list clearfix">
                                    <li>
                                        <div class="icon">
                                            <i class="icon-telephone"></i>
                                        </div>
                                        <div class="text">
                                            <p><a href="tel:188822333">+1 888.22.333</a></p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="icon">
                                            <i class="icon-envelope-2"></i>
                                        </div>
                                        <div class="text">
                                            <p>
                                                <a href="mailto:info@tecture.com">info@tecture.com</a>
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="icon">
                                            <i class="icon-pin"></i>
                                        </div>
                                        <div class="text">
                                            <p>66 Broklyn Street New York, USA</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-2">
                        <div class="footer-widget__column-two ml30">
                            <div class="title-box">
                                <h3>Links</h3>
                            </div>
                            <ul class="footer-widget__column-two-link clearfix">
                                <li>
                                    <router-link to="/">Home</router-link>
                                </li>
                                <li>
                                    <router-link to="/about">About Us</router-link>
                                </li>
                                <li>
                                    <router-link to="/team">Team Member</router-link>
                                </li>
                                <li>
                                    <router-link to="/blog">Blog</router-link>
                                </li>
                                <li>
                                    <router-link to="/projects">Project</router-link>
                                </li>
                                <li>
                                    <router-link to="/services">Service</router-link>
                                </li>
                                <li>
                                    <router-link to="/contact">Contact Us</router-link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-xl-2">
                        <div class="footer-widget__column-two">
                            <div class="title-box">
                                <h3>Our Company</h3>
                            </div>
                            <ul class="footer-widget__column-two-link clearfix">
                                <li><router-link to="/about">About Company</router-link></li>
                                <li><router-link to="/about">Cloudways Users</router-link></li>
                                <li><router-link to="/about">News & Updates</router-link></li>
                                <li><router-link to="/about">Partners</router-link></li>
                                <li><router-link to="/faq">Faq’s</router-link></li>
                                <li><router-link to="/testimonials">Testimonials</router-link></li>
                                <li><router-link to="/contact">Join With Us</router-link></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-2">
                        <div class="footer-widget__column-two">
                            <div class="title-box">
                                <h3>Useful Links</h3>
                            </div>
                            <ul class="footer-widget__column-two-link clearfix">
                                <li><router-link to="/contact">Our Support</router-link></li>
                                <li><router-link to="/about">System Status</router-link></li>
                                <li><router-link to="/about">Knowledge base</router-link></li>
                                <li><router-link to="/contact">Write For Us</router-link></li>
                                <li><router-link to="/about">Properties Right</router-link></li>
                                <li><router-link to="/about">Customer Voice</router-link></li>
                                <li><router-link to="/about">Ebooks</router-link></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-3">
                        <div class="footer-widget__column-two">
                            <div class="title-box">
                                <h3>Newsletter</h3>
                            </div>
                            <div class="footer-widget-newsletter">
                                <div class="text">
                                    <p> Get the latest updates & exclusive content to your inbox.</p>
                                </div>
                                <div class="subscribe-box-form">
                                    <form action="#" method="POST" class="contact-form-validated" @submit.prevent>
                                        <div class="form-group">
                                            <div class="icon">
                                                <i class="icon-envelope-2"></i>
                                            </div>
                                            <input type="email" name="email" placeholder="Email..." required="">
                                        </div>
                                        <button class="submit thm-btn ">
                                            Subscribe Us
                                            <span class="icon-up-right-arrow"></span>
                                        </button>
                                        <div class="result"></div>
                                    </form>
                                    <div class="title">
                                        <div class="icon">
                                            <i class="icon-info"></i>
                                        </div>
                                        <h6>We protect your privacy.</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div class="site-footer-two__bottom">
            <div class="container">
                <div class="site-footer-two__bottom-inner">
                    <div class="copyright-text">
                        <p>Copyright © 2026 <router-link to="/">Tacture</router-link> All rights reserved.</p>
                    </div>
                    <div class="footer-menu">
                        <ul>
                            <li><router-link to="/about">Privacy Policy</router-link></li>
                            <li><router-link to="/about">Terms & Conditions</router-link></li>
                            <li><router-link to="/about">Disclaimer.</router-link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </footer>
</template>

<script setup>
import footerShape from '@/assets/images/shapes/site-footer-shape.png';
</script>
