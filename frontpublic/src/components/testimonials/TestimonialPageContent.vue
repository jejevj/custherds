<template>
    <section class="testimonial-page">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <!-- Testimonial One Single Start -->
                <div v-for="(testimonial, index) in testimonials" :key="index"
                     class="col-xl-4 col-lg-6 col-md-6 wow fadeInLeft" :data-wow-delay="testimonial.delay">
                    <div class="testimonial-one__single">
                        <div class="testimonial-one__client-info">
                            <div class="testimonial-one__client-img">
                                <img :src="testimonial.image" alt="">
                            </div>
                            <div class="testimonial-one__client-content">
                                <h5 class="testimonial-one__client-name">
                                    <router-link to="/testimonials">{{ testimonial.name }}</router-link>
                                </h5>
                                <p class="testimonial-one__client-sub-title">{{ testimonial.position }}</p>
                            </div>
                        </div>
                        <p class="testimonial-one__text">{{ testimonial.text }}</p>
                        <div class="testimonial-one__rating-and-review">
                            <ul class="list-unstyled testimonial-one__rating">
                                <li v-for="star in 4" :key="'filled-' + star">
                                    <div class="testimonial-one__rating-icon">
                                        <img :src="starIconFilled" alt="">
                                    </div>
                                </li>
                                <li>
                                    <div class="testimonial-one__rating-icon">
                                        <img :src="starIconEmpty" alt="">
                                    </div>
                                </li>
                            </ul>
                            <p class="testimonial-one__review">{{ testimonial.rating }}</p>
                        </div>
                    </div>
                </div>
                <!-- Testimonial One Single End -->
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import starIconFilled from '@/assets/images/icon/star-icon-2.png';
import starIconEmpty from '@/assets/images/icon/star-icon-3.png';
import t1 from '@/assets/images/testimonial/testimonial-one-client-1-1.jpg';
import t2 from '@/assets/images/testimonial/testimonial-one-client-1-2.jpg';
import t3 from '@/assets/images/testimonial/testimonial-one-client-1-3.jpg';
import t4 from '@/assets/images/testimonial/testimonial-one-client-1-4.jpg';
import t5 from '@/assets/images/testimonial/testimonial-one-client-1-5.jpg';
import t6 from '@/assets/images/testimonial/testimonial-one-client-1-6.jpg';

const testimonials = [
    {
        name: 'Madriya Merin',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t1,
        delay: '100ms'
    },
    {
        name: 'Mike Hardson',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t2,
        delay: '200ms'
    },
    {
        name: 'Marlon Samuls',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t3,
        delay: '400ms'
    },
    {
        name: 'Marco Jansen',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t4,
        delay: '600ms'
    },
    {
        name: 'Mithel Mars',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t5,
        delay: '800ms'
    },
    {
        name: 'Alisha Martin',
        position: 'Spatial Design',
        text: 'Arrangements are made to transport cargo by sea to meet customers\' international transportation needs.',
        rating: '4.7/6 on Disign',
        image: t6,
        delay: '1000ms'
    }
];
</script>
