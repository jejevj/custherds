<template>
    <section class="blog-three">
        <div class="container">
            <div class="section-title text-center sec-title-animation animation-style1">
                <h2 class="section-title__title title-animation">News and Updates From <br>The Blog Post</h2>
            </div>
            <div class="row">
                <!--Start Single Blog Three-->
                <div class="col-xl-4" v-for="(post, index) in posts" :key="index">
                    <div class="single-blog-three">
                        <div class="img-box">
                            <img :src="post.image" alt="Image">
                            <div class="date-box">
                                <h6>{{ post.date }}</h6>
                            </div>
                        </div>
                        <div class="content-box">
                            <ul class="meta-box">
                                <li>
                                    <router-link to="/blog-details"><i class="far fa-folder-open"></i> {{ post.category }}</router-link>
                                </li>
                                <li>
                                    <router-link to="/blog-details"><i class="far fa-comments"></i> {{ post.comments }}</router-link>
                                </li>
                            </ul>
                            <div class="title-box">
                                <h3>
                                    <router-link to="/blog-details">{{ post.title }}</router-link>
                                </h3>
                            </div>
                            <div class="post-box">
                                <div class="img">
                                    <img :src="post.authorImg" alt="Image">
                                </div>
                                <div class="title">
                                    <h6>PostBy</h6>
                                    <h5>{{ post.author }}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--End Single Blog Three-->
            </div>
        </div>
    </section>
</template>

<script setup>
import b1 from '@/assets/images/blog/blog-3-1.jpg';
import b2 from '@/assets/images/blog/blog-3-2.jpg';
import b3 from '@/assets/images/blog/blog-3-3.jpg';
import a1 from '@/assets/images/blog/post-3-1.jpg';
import a2 from '@/assets/images/blog/post-3-2.jpg';
import a3 from '@/assets/images/blog/post-3-3.jpg';

const posts = [
    { title: 'Top 10 Modern Building Design in Califronia, USA', date: '25 AUG, 2024', category: 'Business', comments: '02 Comments', author: 'brendan Miles', image: b1, authorImg: a1 },
    { title: 'It is a long established fact that a reader will', date: '28 Jun, 2024', category: 'Business', comments: '05 Comments', author: 'Emmett George', image: b2, authorImg: a2 },
    { title: 'Lorem Ipsum is simply dummy text of the printing', date: '20 Nov, 2024', category: 'Business', comments: '10 Comments', author: 'Oliver Beckett', image: b3, authorImg: a3 }
];
</script>
