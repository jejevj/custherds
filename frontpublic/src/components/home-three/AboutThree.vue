<template>
    <section class="about-three">
        <div class="about-three__shape1">
            <img class="float-bob-x" src="@/assets/images/shapes/site-footer-two-shape-1.png" alt="Shape">
        </div>
        <div class="about-three__shape2">
            <img class="float-bob-x" src="@/assets/images/shapes/site-footer-two-shape-2.png" alt="Shape">
        </div>
        <div class="about-three__shape3">
            <img class="float-bob-x" src="@/assets/images/shapes/about-v1-shape1.png" alt="Shape">
        </div>
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <div class="col-xl-6">
                    <div class="about-three__left">
                        <div class="section-title text-left sec-title-animation animation-style2">
                            <h2 class="section-title__title title-animation">Welcome To About Us</h2>
                        </div>
                        <p class="about-three__text">Arrangements are made to transport cargo by sea to meet
                            customers’ international transpor tation needs.the spaces and places we imagine and
                            envision for our clients. To those wanting to make an impact with design.</p>
                        <ul class="about-three__points-list list-unstyled">
                            <li>
                                <div class="icon">
                                    <span class="icon-workstations"></span>
                                </div>
                                <div class="content">
                                    <h3>Evolve Space Designs</h3>
                                    <p>It is a long established fact that a reader will be distracted by<br> the
                                        readable hkljklkl.</p>
                                </div>
                            </li>
                            <li>
                                <div class="icon">
                                    <span class="icon-social-media-marketing"></span>
                                </div>
                                <div class="content">
                                    <h3>Eden Home Styling</h3>
                                    <p>It is a long established fact that a reader will be distracted by <br>the
                                        readable hkljklkl.</p>
                                </div>
                            </li>
                        </ul>
                        <div class="about-three__btn-box">
                            <router-link to="/about" class="thm-btn about-three__btn">More Details <span
                                    class="icon-up-right-arrow"></span> </router-link>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="about-three__right wow slideInRight" data-wow-delay="100ms"
                        data-wow-duration="2500ms">
                        <div class="about-three__img">
                            <img src="@/assets/images/resources/about-three-img-1.jpg" alt="">
                            <div class="about-three__experience-box">
                                <h3 class="about-three__experience-title">Funfacts
                                    in Great<br> Numbers</h3>
                                <div class="about-three__experience">
                                    <div class="about-three__experience-count-shape"></div>
                                    <p class="about-three__experience-sub-title">Years Of <br>Experience</p>
                                    <div class="about-three__experience-count count-box">
                                        <h3 class="count-text" data-stop="25" data-speed="1500">00</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

export default {
    name: "AboutThree",
    data() {
        return {
            sectionShape
        };
    },
    mounted() {
        this.$nextTick(() => {
            const countEls = this.$el.querySelectorAll(".count-text[data-stop]");
            if (countEls.length) {
                this._observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            const target = parseInt(el.dataset.stop, 10) || 0;
                            const duration = parseInt(el.dataset.speed, 10) || 1500;
                            const start = performance.now();
                            const tick = (now) => {
                                const progress = Math.min((now - start) / duration, 1);
                                el.textContent = Math.ceil(progress * target);
                                if (progress < 1) requestAnimationFrame(tick);
                            };
                            requestAnimationFrame(tick);
                            this._observer.unobserve(el);
                        }
                    });
                }, { threshold: 0.2 });
                countEls.forEach(el => this._observer.observe(el));
            }
        });
    },
    beforeUnmount() {
        if (this._observer) this._observer.disconnect();
    }
};
</script>

