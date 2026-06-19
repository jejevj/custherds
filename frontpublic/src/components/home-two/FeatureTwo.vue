<template>
    <section class="feature-two">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <!--Feature Two Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInLeft" data-wow-delay="100ms">
                    <div class="feature-two__single">
                        <div class="feature-two__icon">
                            <span class="icon-staircase"></span>
                        </div>
                        <h3 class="feature-two__title"><router-link to="/interior-design">INTERRIOR DESIGN</router-link></h3>
                        <p class="feature-two__text">Mrittik Architects is a full-service design firm
                            providing , master planning, urban design,</p>
                        <div class="feature-two__shape-box">
                            <div class="feature-two__shape-1"></div>
                            <div class="feature-two__shape-2"></div>
                            <div class="feature-two__shape-3"></div>
                        </div>
                    </div>
                </div>
                <!--Feature Two Single End -->
                <!--Feature Two Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInLeft" data-wow-delay="200ms">
                    <div class="feature-two__single">
                        <div class="feature-two__icon">
                            <span class="icon-plant"></span>
                        </div>
                        <h3 class="feature-two__title"><router-link to="/urban-design">URBAN DESIGN</router-link></h3>
                        <p class="feature-two__text">Mrittik Architects is a full-service design firm
                            providing , master planning, urban design,</p>
                        <div class="feature-two__shape-box">
                            <div class="feature-two__shape-1"></div>
                            <div class="feature-two__shape-2"></div>
                            <div class="feature-two__shape-3"></div>
                        </div>
                    </div>
                </div>
                <!--Feature Two Single End -->
                <!--Feature Two Single Start -->
                <div class="col-xl-4 col-lg-4 wow fadeInLeft" data-wow-delay="300ms">
                    <div class="feature-two__single last-child">
                        <div class="feature-two__icon">
                            <span class="icon-vacuum-cleaner"></span>
                        </div>
                        <h3 class="feature-two__title"><router-link to="/landscape-design">LANDSCAPE DESIGN</router-link></h3>
                        <p class="feature-two__text">Mrittik Architects is a full-service design firm
                            providing , master planning, urban design,</p>
                        <div class="feature-two__shape-box">
                            <div class="feature-two__shape-1"></div>
                            <div class="feature-two__shape-2"></div>
                            <div class="feature-two__shape-3"></div>
                        </div>
                    </div>
                </div>
                <!--Feature Two Single End -->
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';

export default {
    name: "FeatureTwo",
    data() {
        return {
            sectionShape
        };
    }
};
</script>
