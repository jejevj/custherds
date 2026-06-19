<template>
    <section class="services-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="services-two__shape-1 img-bounce">
            <img src="@/assets/images/shapes/services-two-shape-1.png" alt="">
        </div>
        <div class="services-two__wrapper">
            <div class="services-two__top">
                <div class="section-title text-left sec-title-animation animation-style2 wow fadeInLeft"
                    data-wow-delay="100ms">
                    <h2 class="section-title__title title-animation">We Provide Experts to <br> For Your Business
                    </h2>
                </div>
                <div class="services-two__btn-box wow fadeInRight" data-wow-delay="100ms">
                    <router-link to="/services" class="thm-btn services-two__btn">More Details <span
                            class="icon-up-right-arrow"></span> </router-link>
                </div>
            </div>
            <div class="services-two__bottom">
                <ul class="list-unstyled services-two__list">
                    <li class="hover-item wow fadeInUp" data-wow-delay="100ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title"><router-link to="/services">Modify Whole System</router-link>
                                </h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Our associate consultants specialize in a range of
                                    business areas. These include strategic planning, <br> issues resolution,
                                    culture assessment, board effectiveness, retention.</p>
                                <div class="services-two__arrow">
                                    <router-link to="/services"><span class="icon-up-right-arrow-1"></span></router-link>
                                </div>
                            </div>
                        </div>
                        <div class="hover-item__box">
                            <img src="@/assets/images/services/services-2-1.jpg" alt="Image"
                                class="hover-item__box-img">
                        </div>
                    </li>
                    <li class="hover-item wow fadeInUp" data-wow-delay="300ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title"><router-link to="/services">Hard Working Attitudes</router-link>
                                </h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Our associate consultants specialize in a range of
                                    business areas. These include strategic planning, <br> issues resolution,
                                    culture assessment, board effectiveness, retention.</p>
                                <div class="services-two__arrow">
                                    <router-link to="/services"><span class="icon-up-right-arrow-1"></span></router-link>
                                </div>
                            </div>
                        </div>
                        <div class="hover-item__box">
                            <img src="@/assets/images/services/services-2-2.jpg" alt="Image"
                                class="hover-item__box-img">
                        </div>
                    </li>
                    <li class="hover-item wow fadeInUp" data-wow-delay="600ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title"><router-link to="/services">Still up in The air To
                                        Succeed</router-link></h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Our associate consultants specialize in a range of
                                    business areas. These include strategic planning, <br> issues resolution,
                                    culture assessment, board effectiveness, retention.</p>
                                <div class="services-two__arrow">
                                    <router-link to="/services"><span class="icon-up-right-arrow-1"></span></router-link>
                                </div>
                            </div>
                        </div>
                        <div class="hover-item__box">
                            <img src="@/assets/images/services/services-2-3.jpg" alt="Image"
                                class="hover-item__box-img">
                        </div>
                    </li>
                    <li class="hover-item wow fadeInUp" data-wow-delay="900ms">
                        <div class="services-two__single">
                            <div class="services-two__single-left">
                                <div class="services-two__count-box">
                                    <div class="services-two__count"></div>
                                    <div class="services-two__dot"></div>
                                </div>
                                <h3 class="services-two__title"><router-link to="/services">Urban Interventions</router-link></h3>
                            </div>
                            <div class="services-two__single-right">
                                <p class="services-two__text">Our associate consultants specialize in a range of
                                    business areas. These include strategic planning, <br> issues resolution,
                                    culture assessment, board effectiveness, retention.</p>
                                <div class="services-two__arrow">
                                    <router-link to="/services"><span class="icon-up-right-arrow-1"></span></router-link>
                                </div>
                            </div>
                        </div>
                        <div class="hover-item__box">
                            <img src="@/assets/images/services/services-2-4.jpg" alt="Image"
                                class="hover-item__box-img">
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
        return {
            sectionShape
        };
    },
    mounted() {
        this.$nextTick(() => {
            const link = this.$el.querySelectorAll(".hover-item");
            const linkHoverReveal = this.$el.querySelectorAll(".hover-item__box");
            const linkImages = this.$el.querySelectorAll(".hover-item__box-img");
            
            for (let i = 0; i < link.length; i++) {
                if (link[i] && linkHoverReveal[i] && linkImages[i]) {
                    // Store handlers on element so beforeUnmount can remove them
                    link[i]._mousemove = (e) => {
                        linkHoverReveal[i].style.opacity = 1;
                        linkHoverReveal[i].style.transform = `translate(-100%, -50% ) rotate(0deg)`;
                        linkImages[i].style.transform = "scale(1, 1)";
                        linkHoverReveal[i].style.left = e.clientX + "px";
                    };
                    link[i]._mouseleave = () => {
                        linkHoverReveal[i].style.opacity = 0;
                        linkHoverReveal[i].style.transform = `translate(-50%, -50%) rotate(0deg)`;
                        linkImages[i].style.transform = "scale(0.8, 0.8)";
                    };
                    link[i].addEventListener("mousemove", link[i]._mousemove);
                    link[i].addEventListener("mouseleave", link[i]._mouseleave);
                }
            }
        });
    },
    beforeUnmount() {
        // Remove all hover event listeners attached to .hover-item elements
        const links = this.$el ? this.$el.querySelectorAll(".hover-item") : [];
        links.forEach(el => {
            el.removeEventListener("mousemove", el._mousemove);
            el.removeEventListener("mouseleave", el._mouseleave);
        });
    }
};
</script>
