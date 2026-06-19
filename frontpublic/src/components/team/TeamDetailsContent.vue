<template>
    <section class="team-details">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="row">
                <div class="col-xl-6">
                    <div class="team-details__left">
                        <div class="team-details__img">
                            <img :src="teamImage" alt="">
                        </div>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="team-details__right">
                        <ul class="team-details__progress-box list-unstyled">
                            <li v-for="(progress, index) in progressBars" :key="index">
                                <div class="team-details__progress">
                                    <h4 class="team-details__progress-title">{{ progress.title }} - {{ progress.percent }}%</h4>
                                    <div class="bar">
                                        <div class="bar-inner count-bar" :ref="el => barRefs[index] = el"
                                            :data-percent="progress.percent + '%'">
                                            <div class="count-text">{{ progress.percent }}%</div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div class="team-details__address-box">
                            <div class="team-details__client-info">
                                <ul class="team-details__client-info-list list-unstyled">
                                    <li><p>Name</p><h3>{{ memberInfo.name }}</h3></li>
                                    <li><p>Position:</p><h3>{{ memberInfo.position }}</h3></li>
                                    <li><p>Experience</p><h3>{{ memberInfo.experience }}</h3></li>
                                </ul>
                                <ul class="team-details__client-info-list team-details__client-info-list-2 list-unstyled">
                                    <li><p>Phone:</p><h3><a :href="'tel:' + memberInfo.phone">{{ memberInfo.phone }}</a></h3></li>
                                    <li><p>Email:</p><h3><a :href="'mailto:' + memberInfo.email">{{ memberInfo.email }}</a></h3></li>
                                    <li><p>Address:</p><h3>{{ memberInfo.address }}</h3></li>
                                </ul>
                            </div>
                            <div class="team-details__social">
                                <a href="#"><span class="fab fa-facebook-f"></span></a>
                                <a href="#"><span class="fab fa-twitter"></span></a>
                                <a href="#"><span class="fab fa-instagram"></span></a>
                                <a href="#"><span class="fab fa-pinterest-p"></span></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import sectionShape from '@/assets/images/shapes/section-shape-1.png';
import teamImage from '@/assets/images/team/team-details-img-1.jpg';

export default {
    name: "TeamDetailsContent",
    data() {
        return {
            sectionShape,
            teamImage,
            barRefs: [],
            _observer: null,
            progressBars: [
                { title: 'Success Rate',    percent: 69 },
                { title: 'Complete Work',   percent: 79 },
                { title: 'Satisfied Client', percent: 95 },
            ],
            memberInfo: {
                name: 'Archer Graham',
                position: 'WordPress Expert',
                experience: '37 Years',
                phone: '+52656 656 65',
                email: 'youremail@gmail.com',
                address: 'Jones Street New York'
            }
        };
    },
    mounted() {
        this.$nextTick(() => {
            const bars = this.$el.querySelectorAll('.count-bar[data-percent]');
            if (!bars.length) return;
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.width = entry.target.dataset.percent;
                        entry.target.classList.add('counted');
                        this._observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            bars.forEach(el => this._observer.observe(el));
        });
    },
    beforeUnmount() {
        if (this._observer) this._observer.disconnect();
    }
};
</script>
