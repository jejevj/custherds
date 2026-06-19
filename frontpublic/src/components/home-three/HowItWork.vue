<template>
    <section class="how-it-work">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">How It Works</h2>
            </div>
            <div class="row">
                <div class="col-xl-4 col-lg-4">
                    <div class="how-it-work__single">
                        <div class="how-it-work__count"></div>
                        <h3 class="how-it-work__title">INTERRIOR DESIGN</h3>
                        <p class="how-it-work__text">Mrittik Architects is a full-service design<br> firm providing
                            ,
                            master planning, urban<br> design,</p>
                        <div class="how-it-work__icon">
                            <span class="icon-staircase"></span>
                        </div>
                    </div>
                    <div class="how-it-work__single">
                        <div class="how-it-work__count"></div>
                        <h3 class="how-it-work__title">URBAN DESIGN</h3>
                        <p class="how-it-work__text">Mrittik Architects is a full-service design<br> firm providing
                            ,
                            master planning, urban<br> design,</p>
                        <div class="how-it-work__icon">
                            <span class="icon-plant"></span>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4">
                    <div class="how-it-work__img-box">
                        <div class="how-it-work__img">
                            <img src="@/assets/images/resources/how-it-work-img-1.jpg" alt="">
                        </div>
                        <div class="how-it-work__icon-2">
                            <span class="icon-globe"></span>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4">
                    <div class="how-it-work__single how-it-work__single-2">
                        <div class="how-it-work__count"></div>
                        <h3 class="how-it-work__title">LANDSCAPE DESIGN</h3>
                        <p class="how-it-work__text">Mrittik Architects is a full-service design<br> firm providing
                            ,
                            master planning, urban<br> design,</p>
                        <div class="how-it-work__icon">
                            <span class="icon-vacuum-cleaner"></span>
                        </div>
                    </div>
                    <div class="how-it-work__single how-it-work__single-2">
                        <div class="how-it-work__count"></div>
                        <h3 class="how-it-work__title">HOTEL DESIGN</h3>
                        <p class="how-it-work__text">Mrittik Architects is a full-service design<br> firm providing
                            ,
                            master planning, urban<br> design,</p>
                        <div class="how-it-work__icon">
                            <span class="icon-workstations"></span>
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
    name: "HowItWork",
    data() {
        return {
            sectionShape
        };
    }
};
</script>
