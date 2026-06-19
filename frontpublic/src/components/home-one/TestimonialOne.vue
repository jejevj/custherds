<template>
    <section class="testimonial-one">
        <div class="testimonial-one__shape1 wow fadeInRight" data-wow-delay="500ms">
            <img class="float-bob-y" src="@/assets/images/shapes/testimonial-v1-shape1.png" alt="Shape">
        </div>
        <div class="testimonial-one__shape2 wow fadeInLeft" data-wow-delay="500ms">
            <img class="float-bob-y" src="@/assets/images/shapes/testimonial-v1-shape1.png" alt="Shape">
        </div>
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">
                    What Our Clients Say
                </h2>
            </div>
            <div class="testimonial-one__top">
                <div class="row">
                    <!-- Testimonial One Single Start -->
                    <div v-for="(item, index) in topTestimonials" :key="'top-' + index"
                        class="col-xl-4 col-lg-12 col-md-12" :class="item.animationClass" :data-wow-delay="item.delay">
                        <div class="testimonial-one__single">
                            <div class="testimonial-one__client-info">
                                <div class="testimonial-one__client-img">
                                    <img :src="item.image" alt="">
                                </div>
                                <div class="testimonial-one__client-content">
                                    <h5 class="testimonial-one__client-name"><router-link to="/testimonials">{{ item.name }}</router-link></h5>
                                    <p class="testimonial-one__client-sub-title">{{ item.designation }}</p>
                                </div>
                            </div>
                            <p class="testimonial-one__text">{{ item.text }}</p>
                            <div class="testimonial-one__rating-and-review">
                                <ul class="list-unstyled testimonial-one__rating">
                                    <li v-for="n in 5" :key="n">
                                        <div class="testimonial-one__rating-icon">
                                            <img :src="n <= item.stars ? starIcon2 : starIcon3" alt="">
                                        </div>
                                    </li>
                                </ul>
                                <p class="testimonial-one__review">{{ item.ratingText }}</p>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial One Single End -->
                </div>
            </div>


            <div class="testimonial-one__bottom">
                <div class="row">
                    <!-- Testimonial One Single Start -->
                    <div v-for="(item, index) in bottomTestimonials" :key="'bottom-' + index"
                        class="col-xl-4 col-lg-12 col-md-12" :class="item.animationClass" :data-wow-delay="item.delay">
                        <div class="testimonial-one__single">
                            <div class="testimonial-one__client-info">
                                <div class="testimonial-one__client-img">
                                    <img :src="item.image" alt="">
                                </div>
                                <div class="testimonial-one__client-content">
                                    <h5 class="testimonial-one__client-name"><router-link to="/testimonials">{{ item.name }}</router-link></h5>
                                    <p class="testimonial-one__client-sub-title">{{ item.designation }}</p>
                                </div>
                            </div>
                            <p class="testimonial-one__text">{{ item.text }}</p>
                            <div class="testimonial-one__rating-and-review">
                                <ul class="list-unstyled testimonial-one__rating">
                                    <li v-for="n in 5" :key="n">
                                        <div class="testimonial-one__rating-icon">
                                            <img :src="n <= item.stars ? starIcon2 : starIcon3" alt="">
                                        </div>
                                    </li>
                                </ul>
                                <p class="testimonial-one__review">{{ item.ratingText }}</p>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial One Single End -->
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import t1 from '@/assets/images/testimonial/testimonial-one-client-1-1.jpg';
import t2 from '@/assets/images/testimonial/testimonial-one-client-1-2.jpg';
import t3 from '@/assets/images/testimonial/testimonial-one-client-1-3.jpg';
import t4 from '@/assets/images/testimonial/testimonial-one-client-1-4.jpg';
import t5 from '@/assets/images/testimonial/testimonial-one-client-1-5.jpg';
import starIcon2 from '@/assets/images/icon/star-icon-2.png';
import starIcon3 from '@/assets/images/icon/star-icon-3.png';

export default {
    name: "TestimonialOne",
    data() {
        return {
            starIcon2,
            starIcon3,
            topTestimonials: [
                {
                    name: "Madriya Merin", designation: "Spatial Design", image: t1,
                    text: "Arrangements are made to transport cargo by sea to meet customers’ international transportation needs.",
                    ratingText: "4.7/6 on Disign", stars: 4, animationClass: "wow fadeInLeft", delay: "100ms"
                },
                {
                    name: "Mike Hardson", designation: "Spatial Design", image: t2,
                    text: "Arrangements are made to transport cargo by sea to meet customers’ international transportation needs.",
                    ratingText: "4.7/6 on Disign", stars: 5, animationClass: "wow fadeInUp", delay: "200ms"
                },
                {
                    name: "Marlon Samuls", designation: "Spatial Design", image: t3,
                    text: "Arrangements are made to transport cargo by sea to meet customers’ international transportation needs.",
                    ratingText: "4.7/6 on Disign", stars: 4, animationClass: "wow fadeInRight", delay: "400ms"
                }
            ],
            bottomTestimonials: [
                {
                    name: "Marco Jansen", designation: "Spatial Design", image: t4,
                    text: "Arrangements are made to transport cargo by sea to meet customers’ international transportation needs.",
                    ratingText: "4.7/6 on Disign", stars: 5, animationClass: "wow fadeInLeft", delay: "600ms"
                },
                {
                    name: "Mithel Mars", designation: "Spatial Design", image: t5,
                    text: "Arrangements are made to transport cargo by sea to meet customers’ international transportation needs.",
                    ratingText: "4.7/6 on Disign", stars: 5, animationClass: "wow fadeInRight", delay: "800ms"
                }
            ]
        };
    }
};
</script>
