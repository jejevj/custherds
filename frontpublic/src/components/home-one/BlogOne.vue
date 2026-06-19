<template>
    <section class="blog-one">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Latest News & Articles From <br> The Blog Posts
                </h2>
            </div>
            <div class="row">
                <!-- Blog One Single Start -->
                <div v-for="(blog, index) in blogs" :key="index" :class="blog.columnClass" :data-wow-delay="blog.delay">
                    <div class="blog-one__single">
                        <div class="blog-one__img">
                            <img :src="blog.image" alt="">
                        </div>
                        <div class="blog-one__content">
                            <div class="blog-one__content-shape-1"
                                style="background-image: url(@/assets/images/shapes/blog-one-content-shape-1.png);">
                            </div>
                            <div class="blog-one__date-and-title-box">
                                <div class="blog-one__date">
                                    <h3>{{ blog.day }}</h3>
                                    <p>{{ blog.monthYear }}</p>
                                </div>
                                <div class="blog-one__title-box">
                                    <h3 class="blog-one__title"><router-link to="/blog-details"
                                            v-html="blog.title"></router-link></h3>
                                </div>
                            </div>
                            <div class="blog-one__btn-box">
                                <router-link to="/blog-details" class="thm-btn blog-one__btn">More Details <span
                                        class="icon-up-right-arrow"></span> </router-link>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Blog One Single End -->
            </div>
        </div>
    </section>
</template>

<script>
import b1 from '@/assets/images/blog/blog-1-1.jpg';
import b2 from '@/assets/images/blog/blog-1-2.jpg';
import b3 from '@/assets/images/blog/blog-1-3.jpg';

export default {
    name: "BlogOne",
    data() {
        return {
            blogs: [
                {
                    title: "Top 10 Modern Building <br> Design in Califronia, USA",
                    day: "23", monthYear: "Sep 2024", image: b1,
                    columnClass: "col-xl-4 col-lg-4 wow fadeInLeft", delay: "100ms"
                },
                {
                    title: "It is a long established <br> fact that a reader will",
                    day: "13", monthYear: "Sep 2024", image: b2,
                    columnClass: "col-xl-4 col-lg-4 wow fadeInUp", delay: "200ms"
                },
                {
                    title: "Lorem Ipsum is simply <br> dummy text of the printing",
                    day: "04", monthYear: "Sep 2024", image: b3,
                    columnClass: "col-xl-4 col-lg-4 wow fadeInRight", delay: "300ms"
                }
            ]
        };
    }
};
</script>
