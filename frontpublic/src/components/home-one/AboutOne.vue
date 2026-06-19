<template>
    <section class="about-one">
        <div class="about-one__shape1">
            <img class="float-bob-x" src="@/assets/images/shapes/about-v1-shape1.png" alt="Shape">
        </div>
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="row">
                <div class="col-xl-5">
                    <div class="about-one__left">
                        <ul class="list-unstyled about-one__img-list">
                            <li>
                                <div class="about-one__img">
                                    <img src="@/assets/images/resources/about-one-1-1.jpg" alt="">
                                </div>
                            </li>
                            <li>
                                <div class="about-one__img">
                                    <img src="@/assets/images/resources/about-one-1-2.jpg" alt="">
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-xl-7">
                    <div class="about-one__right wow fadeInLeft" data-wow-delay="300ms">
                        <div class="about-one__content">
                            <div class="about-one__content-shape-1"
                                style="background-image: url(@/assets/images/shapes/about-one-content-shape-1.png);">
                            </div>
                            <div class="section-title sec-title-animation animation-style2">
                                <h2 class="section-title__title title-animation">Where Inovation Meet <br>
                                    Interior Design</h2>
                            </div>
                            <div class="about-one__design-make">
                                <div class="about-one__design-make-img">
                                    <img src="@/assets/images/resources/about-one-design-make-img-1.jpg" alt="">
                                </div>
                                <div class="about-one__design-make-content">
                                    <h5 class="about-one__design-make-title">Design Make Dream</h5>
                                    <p class="about-one__design-make-text">Rapidiously evolve pandemic experiences
                                        <br>
                                        and Dramatically administrate</p>
                                </div>
                            </div>
                            <ul class="about-one__progress-list list-unstyled" ref="progressList">
                                <li class="about-one__progress">
                                    <h4 class="about-one__progress-title">Architecture</h4>
                                    <div class="bar">
                                        <div class="bar-inner count-bar" :class="{ counted: isVisible }" :style="{ width: isVisible ? '85%' : '0%' }">
                                            <div class="count-text">85%</div>
                                        </div>
                                    </div>
                                </li>
                                <li class="about-one__progress">
                                    <h4 class="about-one__progress-title">Interior Design </h4>
                                    <div class="bar">
                                        <div class="bar-inner count-bar" :class="{ counted: isVisible }" :style="{ width: isVisible ? '90%' : '0%' }">
                                            <div class="count-text">90%</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "AboutOne",
    data() {
        return {
            isVisible: false
        };
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$refs.progressList) {
                this._observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.isVisible = true;
                            this._observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.2 });
                this._observer.observe(this.$refs.progressList);
            }
        });
    },
    beforeUnmount() {
        if (this._observer) this._observer.disconnect();
    }
};
</script>

