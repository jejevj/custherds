<template>
    <section id="contact" class="contact-page pdt0">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
            <div class="contact-page__inner">
                <div class="row">
                    <div class="col-xl-5 col-lg-5">
                        <div class="contact-page__left">
                            <div class="contact-page__information">
                                <h3 class="contact-page__information-title">Contact Informatlon</h3>
                                <ul class="contact-page__information-list list-unstyled">
                                    <li>
                                        <div class="icon">
                                            <span class="icon-pin"></span>
                                        </div>
                                        <div class="content">
                                            <h3>Address</h3>
                                            <p>7515 Carriage Court, CA, 92236 USA</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="icon">
                                            <span class="icon-trading"></span>
                                        </div>
                                        <div class="content">
                                            <h3>Contact Namber</h3>
                                            <p><a href="tel:66561598596969">(+6656) 1598596969</a></p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="icon">
                                            <span class="icon-envelope-1"></span>
                                        </div>
                                        <div class="content">
                                            <h3>Email Us</h3>
                                            <p><a href="mailto:shifamoni6790@gmail.com">shifamoni6790@gmail.com</a>
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>


                    <div class="col-xl-7 col-lg-7">
                        <div class="contact-page__right">
                            <h3 class="contact-page__contact-title">Get A Quote</h3>
                            <form id="contact-form" class="contact-page__form" action="assets/mail.php" method="POST">
                                <div class="row">
                                    <div class="col-lg-6">
                                        <div class="contact-page__input-box">
                                            <input type="text" name="name" placeholder="Your name" required="">
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="contact-page__input-box">
                                            <input type="email" name="email" placeholder="Your Email" required="">
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="contact-page__input-box">
                                            <input type="number" placeholder="Mobile" name="number">
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="contact-page__input-box">
                                            <input type="text" placeholder="Company" name="company">
                                        </div>
                                    </div>
                                    <div class="col-xl-12">
                                        <div class="contact-page__input-box text-message-box">
                                            <textarea name="message" placeholder="Messege"></textarea>
                                        </div>
                                        <div class="contact-page__btn-box">
                                            <button type="submit" class="thm-btn contact-page__btn"
                                                data-loading-text="Please wait...">
                                                Get Started
                                                <span class="icon-up-right-arrow"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <p class="ajax-response mb-0 error"></p>
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
        }
    }
};
</script>
