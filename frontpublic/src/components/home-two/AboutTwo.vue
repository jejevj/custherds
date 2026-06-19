<template>
    <section class="about-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="about-two__shape-1 float-bob-x">
            <img src="@/assets/images/shapes/about-two-shape-1.png" alt="">
        </div>
        <div class="container">
            <div class="row">
                <div class="col-xl-6 wow fadeInLeft" data-wow-delay="100ms">
                    <div class="about-two__left">
                        <div class="section-title text-left sec-title-animation animation-style2">
                            <h2 class="section-title__title title-animation">Simple Minimalist For Your Home
                                Interior</h2>
                        </div>
                        <p class="about-two__text">Inoterior design consultancy firm that brings sensitivity to the
                            design top restaurants,<br> hotels, offices & homes around the world. We stand for
                            quality,
                        </p>
                        <ul class="list-unstyled about-two__history">
                            <li>
                                <div class="about-two__history-single">
                                    <h3 class="about-two__history-year">1997</h3>
                                    <p class="about-two__history-text">We are committed to the impeccable
                                        craftsmanship and luxury is reflected in</p>
                                </div>
                            </li>
                            <li>
                                <div class="about-two__history-single">
                                    <h3 class="about-two__history-year">2027</h3>
                                    <p class="about-two__history-text">We are committed to the impeccable
                                        craftsmanship and luxury is reflected in</p>
                                </div>
                            </li>
                        </ul>
                        <div class="about-two__btn-box">
                            <router-link to="/about" class="thm-btn about-two__btn">More Details <span
                                    class="icon-up-right-arrow"></span> </router-link>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 wow fadeInRight" data-wow-delay="300ms">
                    <div class="about-two__right">
                        <div class="about-two__img">
                            <img src="@/assets/images/resources/about-two-img-1.jpg" alt="">
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
    name: "AboutTwo",
    data() {
        return {
            sectionShape
        };
    }
};
</script>
