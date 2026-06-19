<template>
    <section class="design-interior">
        <div class="section-shape-1" style="background-image: url(@/assets/images/shapes/section-shape-1.png);"></div>
        <div class="container">
            <div class="section-title text-left sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">Elevate Your Lifestyle With <br>
                    Our Designs Interior</h2>
            </div>
            <div class="design-interior__inner">
                <div class="row">
                    <div class="col-xl-10">
                        <div class="design-interior__left wow fadeInLeft" data-wow-delay="100ms">
                            <div class="design-interior__shape-1"
                                style="background-image: url(@/assets/images/shapes/design-interior-shape-1.png);">
                            </div>
                            <ul class="list-unstyled design-interior__list">
                                <li v-for="(item, index) in items" :key="index">
                                    <div class="design-interior__single">
                                        <h4 class="design-interior__title"><router-link :to="item.link">{{ item.title }}</router-link></h4>
                                        <p class="design-interior__text">{{ item.text }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-xl-2">
                        <div class="design-interior__right wow fadeInRight" data-wow-delay="300ms">
                            <div class="design-interior__img">
                                <img src="@/assets/images/resources/design-interior-img-1.jpg" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "DesignInterior",
    data() {
        return {
            items: [
                { title: "Harmony Interiors", link: "/harmony-interiors", text: "It is a long established fact that a reader will be distracted by the readable hkljklkl." },
                { title: "Amman Rotane Hotel", link: "/about", text: "It is a long established fact that a reader will be distracted by the readable hkljklkl." },
                { title: "European Lard Sration", link: "/about", text: "It is a long established fact that a reader will be distracted by the readable hkljklkl." },
                { title: "Harmony Interiors", link: "/harmony-interiors", text: "It is a long established fact that a reader will be distracted by the readable hkljklkl." }
            ]
        };
    }
};
</script>
