<template>
    <section class="blog-one blog-three">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">Latest News & Articles From <br> The Blog Posts
                </h2>
            </div>
            <div class="row">
                <!-- Blog One Single Start -->
                <div v-for="(post, index) in blogPosts" :key="index" :class="`col-xl-4 col-lg-4 wow ${post.animation}`" :data-wow-delay="post.delay">
                    <div class="blog-one__single">
                        <div class="blog-one__img">
                            <img :src="post.image" alt="">
                        </div>
                        <div class="blog-one__content">
                            <div class="blog-one__content-shape-1"
                                :style="{ backgroundImage: 'url(' + blogShape + ')' }">
                            </div>
                            <div class="blog-one__date-and-title-box">
                                <div class="blog-one__date">
                                    <h3>{{ post.day }}</h3>
                                    <p>{{ post.month }}</p>
                                </div>
                                <div class="blog-one__title-box">
                                    <h3 class="blog-one__title"><router-link to="/blog-details">{{ post.title }}</router-link></h3>
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
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import blogShape from '@/assets/images/shapes/blog-one-content-shape-1.png';
import b1 from '@/assets/images/blog/blog-1-1.jpg';
import b2 from '@/assets/images/blog/blog-1-2.jpg';
import b3 from '@/assets/images/blog/blog-1-3.jpg';

export default {
    name: "BlogThree",
    data() {
        return {
            sectionShape,
            blogShape,
            blogPosts: [
                 { title: "Top 10 Modern Building Design in California", day: "23", month: "Sep 2024", image: b1, animation: "fadeInLeft", delay: "100ms" },
                 { title: "It is a long established fact that a reader", day: "13", month: "Sep 2024", image: b2, animation: "fadeInUp", delay: "200ms" },
                 { title: "Lorem Ipsum is simply dummy text", day: "04", month: "Sep 2024", image: b3, animation: "fadeInRight", delay: "300ms" },
            ]
        };
    }
};
</script>
