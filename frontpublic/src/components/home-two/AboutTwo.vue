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
                            <h2 class="section-title__title title-animation">Affiliate Partners</h2>
                        </div>
                        <p class="about-two__text">
                            Bring your networks to the best experiences — luxury villas, beach clubs,
                            restaurants, spas, activities and earn commission effortlessly.
                        </p>
                        <ul class="list-unstyled about-two__history">
                            <li>
                                <div class="about-two__history-single">
                                    <h3 class="about-two__history-year"><span class="icon-right"></span></h3>
                                    <p class="about-two__history-text">No need to collect cash &amp; transparent commission rate</p>
                                </div>
                            </li>
                            <li>
                                <div class="about-two__history-single">
                                    <h3 class="about-two__history-year"><span class="icon-right"></span></h3>
                                    <p class="about-two__history-text">Build long-term business partners with monthly payout &amp; legal protection</p>
                                </div>
                            </li>
                        </ul>
                        <div class="about-two__btn-box">
                            <router-link to="/contact" class="thm-btn about-two__btn">Start Earning Today! <span
                                    class="icon-up-right-arrow"></span></router-link>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 wow fadeInRight" data-wow-delay="300ms">
                    <div class="about-two__right">
                        <div class="about-two__img">
                            <img src="https://www.custherds.com/assets/images/slide/page1-2.webp?v=44806c3050915c018d83a707fe577223" alt="Affiliate Partners">
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
