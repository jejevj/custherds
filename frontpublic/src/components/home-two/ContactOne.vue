<template>
    <section class="contact-one">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="contact-one__shape-2 float-bob-y">
            <img src="@/assets/images/shapes/contact-one-shape-2.png" alt="">
        </div>
        <div class="container">
            <div class="row">
                <div class="col-xl-7">
                    <div class="contact-one__left wow slideInLeft" data-wow-delay="100ms"
                        data-wow-duration="2500ms">
                        <div class="contact-one__inner">
                            <div class="contact-one__shape-1 float-bob-x">
                                <img src="@/assets/images/shapes/contact-one-shape-1.png" alt="">
                            </div>
                            <form class="contact-form-validated contact-one__form" action="assets/inc/sendemail.php"
                                method="post" novalidate="novalidate">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="contact-one__input-box">
                                            <input type="text" name="name" placeholder="Your Nome" required="">
                                        </div>
                                    </div>
                                    <div class="col-lg-12">
                                        <div class="contact-one__input-box">
                                            <input type="email" name="email" placeholder="Email Address"
                                                required="">
                                        </div>
                                    </div>
                                    <div class="col-lg-12">
                                        <div class="contact-one__input-box">
                                            <input type="text" name="Phone" placeholder="Your Phone" required="">
                                        </div>
                                    </div>
                                    <div class="col-lg-12">
                                        <div class="contact-one__input-box">
                                            <input type="text" name="Subject" placeholder="Subject" required="">
                                        </div>
                                    </div>
                                    <div class="col-xl-12">
                                        <div class="contact-one__input-box text-message-box">
                                            <textarea name="message"
                                                placeholder="How can we help you? Feel free to get in touch!"></textarea>
                                        </div>
                                        <div class="contact-one__btn-box">
                                            <button type="submit" class="thm-btn contact-one__btn">Learn More<span
                                                    class="icon-up-right-arrow"></span></button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div class="result"></div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-5">
                    <div class="contact-one__right">
                        <div class="contact-one__right-content sec-title-animation animation-style2">
                            <h3 class="contact-one__title title-animation">Do You need Any Help? <br>
                                Send Message.</h3>
                            <div class="contact-one__contact-info">
                                <div class="contact-one__contact-icon">
                                    <span class="icon-customer-service"></span>
                                </div>
                                <div class="contact-one__contact-icon-2">
                                    <span class="icon-customer-service"></span>
                                </div>
                                <div class="contact-one__contact-number-box">
                                    <p>Call us for ony inquiry</p>
                                    <h5><a href="tel:4844987989">( 484 ) 4987 989</a></h5>
                                </div>
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

export default {
    name: "ContactOne",
    data() {
        return {
            sectionShape
        };
    }
};
</script>
