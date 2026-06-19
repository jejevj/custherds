<template>
    <section class="services-three">
        <div class="services-three__bg"
            :style="{ backgroundImage: 'url(' + bgImage + ')' }"></div>
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Where Inovation Meet <br>
                    Interior Design</h2>
            </div>
            <div class="row">
                <!--Services Three Single Start -->
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInLeft" data-wow-delay="100ms">
                    <div class="services-three__single">
                        <div class="services-three__icon">
                            <span class="icon-staircase"></span>
                        </div>
                        <h3 class="services-three__title"><router-link to="/interior-design"> Architecture & <br>
                                Building </router-link></h3>
                        <div class="services-three__img">
                            <img src="@/assets/images/services/services-3-1.jpg" alt="">
                        </div>
                        <p class="services-three__text">Our associate consultants specialize in a range of business
                            areas. These include strategic planning, issues resolution, culture assessment, board
                            effectiveness, retention.</p>
                        <div class="services-three__arrow">
                            <router-link to="/interior-design"><span class="icon-up-right-arrow-1"></span></router-link>
                        </div>
                    </div>
                </div>
                <!--Services Three Single End -->
                <!--Services Three Single Start -->
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInLeft" data-wow-delay="300ms">
                    <div class="services-three__single">
                        <div class="services-three__icon">
                            <span class="icon-workstations"></span>
                        </div>
                        <h3 class="services-three__title"><router-link to="/evolve-space-designs"> Evolve Space <br>
                                Designs </router-link></h3>
                        <div class="services-three__img">
                            <img src="@/assets/images/services/services-3-2.jpg" alt="">
                        </div>
                        <p class="services-three__text">Our associate consultants specialize in a range of business
                            areas. These include strategic planning, issues resolution, culture assessment, board
                            effectiveness, retention.</p>
                        <div class="services-three__arrow">
                            <router-link to="/evolve-space-designs"><span class="icon-up-right-arrow-1"></span></router-link>
                        </div>
                    </div>
                </div>
                <!--Services Three Single End -->
                <!--Services Three Single Start -->
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInLeft" data-wow-delay="600ms">
                    <div class="services-three__single">
                        <div class="services-three__icon">
                            <span class="icon-plant"></span>
                        </div>
                        <h3 class="services-three__title"><router-link to="/eden-home-styling"> Eden Home <br> Styling
                            </router-link></h3>
                        <div class="services-three__img">
                            <img src="@/assets/images/services/services-3-3.jpg" alt="">
                        </div>
                        <p class="services-three__text">Our associate consultants specialize in a range of business
                            areas. These include strategic planning, issues resolution, culture assessment, board
                            effectiveness, retention.</p>
                        <div class="services-three__arrow">
                            <router-link to="/eden-home-styling"><span class="icon-up-right-arrow-1"></span></router-link>
                        </div>
                    </div>
                </div>
                <!--Services Three Single End -->
                <!--Services Three Single Start -->
                <div class="col-xl-3 col-lg-6 col-md-6 wow fadeInLeft" data-wow-delay="800ms">
                    <div class="services-three__single">
                        <div class="services-three__icon">
                            <span class="icon-vacuum-cleaner"></span>
                        </div>
                        <h3 class="services-three__title"><router-link to="/harmony-interiors"> Harmony Design <br>
                                Interiors </router-link></h3>
                        <div class="services-three__img">
                            <img src="@/assets/images/services/services-3-4.jpg" alt="">
                        </div>
                        <p class="services-three__text">Our associate consultants specialize in a range of business
                            areas. These include strategic planning, issues resolution, culture assessment, board
                            effectiveness, retention.</p>
                        <div class="services-three__arrow">
                            <router-link to="/harmony-interiors"><span class="icon-up-right-arrow-1"></span></router-link>
                        </div>
                    </div>
                </div>
                <!--Services Three Single End -->
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import bgImage from '@/assets/images/shapes/site-footer-shape-1.jpg';

export default {
    name: "ServicesThree",
    data() {
        return {
            sectionShape,
            bgImage
        };
    }
};
</script>
