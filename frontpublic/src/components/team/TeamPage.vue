<template>
    <section class="team-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <!--Team One Single Start -->
                <div v-for="(member, index) in teamMembers" :key="index"
                     class="col-xl-4 col-lg-4 wow fadeInLeft" :data-wow-delay="member.delay">
                    <div class="team-one__sinlge">
                        <div class="team-one__img">
                            <img :src="member.image" alt="">
                        </div>
                        <div class="team-one__content">
                            <div class="team-one__social">
                                <a href="#"><span class="fab fa-facebook-f"></span></a>
                                <a href="#"><span class="fab fa-vine"></span></a>
                                <a href="#"><span class="fab fa-twitter"></span></a>
                                <a href="#"><span class="fab fa-instagram"></span></a>
                            </div>
                            <p class="team-one__sub-title">{{ member.position }}</p>
                            <h3 class="team-one__title">
                                <router-link to="/team-details">{{ member.name }}</router-link>
                            </h3>
                        </div>
                    </div>
                </div>
                <!--Team One Single End -->
            </div>
        </div>
    </section>
</template>

<script setup>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import t1 from '@/assets/images/team/team-1-1.jpg';
import t2 from '@/assets/images/team/team-1-2.jpg';
import t3 from '@/assets/images/team/team-1-3.jpg';
import t4 from '@/assets/images/team/team-1-4.jpg';
import t5 from '@/assets/images/team/team-1-5.jpg';
import t6 from '@/assets/images/team/team-1-6.jpg';

const teamMembers = [
    {
        name: 'Jonathan S. Wilcox',
        position: 'Teka dibe bacchu',
        image: t1,
        delay: '100ms'
    },
    {
        name: 'Jessica Brown',
        position: 'Teka dibe bacchu',
        image: t2,
        delay: '300ms'
    },
    {
        name: 'Jonathan Trot',
        position: 'Teka dibe bacchu',
        image: t3,
        delay: '600ms'
    },
    {
        name: 'Ryan Bennet',
        position: 'Teka dibe bacchu',
        image: t4,
        delay: '900ms'
    },
    {
        name: 'Alister Cook',
        position: 'Teka dibe bacchu',
        image: t5,
        delay: '1200ms'
    },
    {
        name: 'Jonathan Campbel',
        position: 'Teka dibe bacchu',
        image: t6,
        delay: '1500ms'
    }
];
</script>
