<template>
    <section class="team-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Where Inovation Meet <br>
                    Interior Design</h2>
            </div>
            <div class="row">
                <!--Team One Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInLeft" data-wow-delay="100ms">
                    <div class="team-one__sinlge">
                        <div class="team-one__img">
                            <img src="@/assets/images/team/team-1-1.jpg" alt="">
                        </div>
                        <div class="team-one__content">
                            <div class="team-one__social">
                                <a href="#"><span class="fab fa-facebook-f"></span></a>
                                <a href="#"><span class="fab fa-vine"></span></a>
                                <a href="#"><span class="fab fa-twitter"></span></a>
                                <a href="#"><span class="fab fa-instagram"></span></a>
                            </div>
                            <p class="team-one__sub-title">Teka dibe bacchu</p>
                            <h3 class="team-one__title"><router-link to="/team-details">Jonathan S. Wilcox</router-link></h3>
                        </div>
                    </div>
                </div>
                <!--Team One Single End -->
                <!--Team One Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="300ms">
                    <div class="team-one__sinlge">
                        <div class="team-one__img">
                            <img src="@/assets/images/team/team-1-2.jpg" alt="">
                        </div>
                        <div class="team-one__content">
                            <div class="team-one__social">
                                <a href="#"><span class="fab fa-facebook-f"></span></a>
                                <a href="#"><span class="fab fa-vine"></span></a>
                                <a href="#"><span class="fab fa-twitter"></span></a>
                                <a href="#"><span class="fab fa-instagram"></span></a>
                            </div>
                            <p class="team-one__sub-title">Teka dibe bacchu</p>
                            <h3 class="team-one__title"><router-link to="/team-details">Jessica Brown</router-link></h3>
                        </div>
                    </div>
                </div>
                <!--Team One Single End -->
                <!--Team One Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInRight" data-wow-delay="600ms">
                    <div class="team-one__sinlge">
                        <div class="team-one__img">
                            <img src="@/assets/images/team/team-1-3.jpg" alt="">
                        </div>
                        <div class="team-one__content">
                            <div class="team-one__social">
                                <a href="#"><span class="fab fa-facebook-f"></span></a>
                                <a href="#"><span class="fab fa-vine"></span></a>
                                <a href="#"><span class="fab fa-twitter"></span></a>
                                <a href="#"><span class="fab fa-instagram"></span></a>
                            </div>
                            <p class="team-one__sub-title">Teka dibe bacchu</p>
                            <h3 class="team-one__title"><router-link to="/team-details">Jonathan Trot</router-link></h3>
                        </div>
                    </div>
                </div>
                <!--Team One Single End -->
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

export default {
    name: "TeamOne",
    data() {
        return {
            sectionShape
        };
    }
};
</script>
