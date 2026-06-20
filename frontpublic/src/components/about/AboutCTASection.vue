<template>
    <section class="contact-one">
        <div class="contact-one__bg" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page2-3.webp)' }">
            <div class="contact-one__overlay"></div>
            <div class="container">
                <div class="contact-one__inner text-center">
                    <h2 class="contact-one__title">Join Us Today!</h2>
                    <p class="contact-one__text">
                        Step into a professional partnership where we grow, win, and succeed as one.
                    </p>
                    <div class="contact-one__btn-box">
                        <router-link to="/contact" class="thm-btn contact-one__btn">
                            Affiliate Partner <span class="icon-up-right-arrow"></span>
                        </router-link>
                        <router-link to="/contact" class="thm-btn contact-one__btn contact-one__btn--alt">
                            Business Vendor <span class="icon-up-right-arrow"></span>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "AboutCTASection"
};
</script>

<style scoped>
.contact-one__bg {
    position: relative;
    background-size: cover;
    background-position: center;
    padding: 120px 0;
}
.contact-one__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
}
.contact-one__inner {
    position: relative;
    z-index: 2;
}
.contact-one__title {
    color: #fff;
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 20px;
}
.contact-one__text {
    color: #fff;
    font-size: 18px;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}
.contact-one__btn-box {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}
</style>
