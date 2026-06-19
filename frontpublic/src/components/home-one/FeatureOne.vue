<template>
    <section class="feature-one">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="feature-one__inner">
                <ul class="list-unstyled feature-one__list">
                    <li v-for="(feature, index) in features" :key="index" :class="feature.animationClass" :data-wow-delay="feature.delay">
                        <div class="icon">
                            <span :class="feature.icon"></span>
                        </div>
                        <div class="text">
                            <p>
                                <router-link :to="feature.link" v-html="feature.text"></router-link>
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "FeatureOne",
    data() {
        return {
            features: [
                {
                    icon: "icon-engineer",
                    text: "360 Panorama & 3D Virtual <br> Reality Experience",
                    link: "/services",
                    animationClass: "wow fadeInLeft",
                    delay: "100ms"
                },
                {
                    icon: "icon-workstations",
                    text: "Crafted Furniture <br> and Sustainable Material",
                    link: "/services",
                    animationClass: "wow fadeInUp",
                    delay: "200ms"
                },
                {
                    icon: "icon-cyber-security",
                    text: "Young, Enthusiastic and <br> Innovative Architects",
                    link: "/services",
                    animationClass: "wow fadeInRight",
                    delay: "300ms"
                }
            ]
        };
    }
};
</script>
