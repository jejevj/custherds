<template>
    <section class="services-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="services-two__wrapper">
            <div class="services-two__top">
                <div class="section-title text-left sec-title-animation animation-style2 wow fadeInLeft" data-wow-delay="100ms">
                    <h2 class="section-title__title title-animation">Business Vendor</h2>
                </div>
                <div class="services-two__btn-box wow fadeInRight" data-wow-delay="100ms">
                    <router-link to="/contact" class="thm-btn services-two__btn">Best Business Traffic Platform <span class="icon-up-right-arrow"></span></router-link>
                </div>
            </div>
            <div class="services-two__bottom">
                <ul class="list-unstyled services-two__list">
                    <li class="wow fadeInUp" data-wow-delay="100ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title">Performance-Based Commission</h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">We herd customers to your business at no cost. You only pay when a service is completed — fair, transparent, and results-driven.</p>
                            </div>
                        </div>
                    </li>
                    <li class="wow fadeInUp" data-wow-delay="300ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title">No Upfront Marketing Cost</h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Stop spending on ads that don't convert. Custherds brings you ready-to-buy customers through a trusted network of affiliate partners.</p>
                            </div>
                        </div>
                    </li>
                    <li class="wow fadeInUp" data-wow-delay="600ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title">Unlimited Affiliate Partners</h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Scale your reach with an unlimited pool of affiliate partners who actively promote your business to their personal and professional networks.</p>
                            </div>
                        </div>
                    </li>
                    <li class="wow fadeInUp" data-wow-delay="900ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title">Booking Management Dashboard</h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Manage all incoming bookings, track affiliate performance, and monitor your revenue in one clean, easy-to-use dashboard.</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

export default {
    name: "ServicesTwo",
    data() {
        return { sectionShape };
    }
};
</script>
