<template>
  <div>
    <Preloader />
    <ChatPopup />
    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>
    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />

      <PageHeader
        title="Contact Us"
        subtitle="We'd love to hear from you!"
      />

      <section class="contact-page py-5">
        <div class="container">

          <!-- Top: reach us info -->
          <div class="row justify-content-center mb-5">
            <div class="col-12 col-md-4 mb-4">
              <div class="cus-contact-card">
                <span class="cus-contact-card__icon icon-pin"></span>
                <h4>Find Us</h4>
                <p>Bali, Indonesia</p>
              </div>
            </div>
            <div class="col-12 col-md-4 mb-4">
              <div class="cus-contact-card">
                <span class="cus-contact-card__icon icon-telephone"></span>
                <h4>Phone / WhatsApp</h4>
                <p><a href="https://wa.me/6287761081555" target="_blank">+62877 6108 1555</a></p>
              </div>
            </div>
            <div class="col-12 col-md-4 mb-4">
              <div class="cus-contact-card">
                <span class="cus-contact-card__icon icon-envelope-1"></span>
                <h4>Email</h4>
                <p><a href="mailto:team@custherds.com">team@custherds.com</a></p>
              </div>
            </div>
          </div>

          <!-- Middle: Map + Form -->
          <div class="row g-5">
            <!-- Google Maps embed — Bali center -->
            <div class="col-12 col-lg-5">
              <h3 class="contact-page__section-title">Our Location</h3>
              <div class="cus-map-wrap">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252588.93043882894!2d114.95900595!3d-8.4095178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd141d3e8100fa1%3A0x24910fb14b24e690!2sBali%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1718900000000"
                  width="100%" height="400" style="border:0; border-radius: 12px;"
                  allowfullscreen="" loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="col-12 col-lg-7">
              <h3 class="contact-page__section-title">Leave a Message</h3>
              <form @submit.prevent="submitContact" class="cus-contact-form">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <div class="cus-contact-form__field">
                      <label>Name <span class="req">*</span></label>
                      <input type="text" v-model="cf.name" placeholder="Enter your name" required />
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="cus-contact-form__field">
                      <label>Email <span class="req">*</span></label>
                      <input type="email" v-model="cf.envelope" placeholder="Enter your email" required />
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="cus-contact-form__field">
                      <label>Message <span class="req">*</span></label>
                      <textarea v-model="cf.message" rows="5" placeholder="Your message here..." required></textarea>
                    </div>
                  </div>

                  <!-- Math Captcha -->
                  <div class="col-12">
                    <div class="cus-contact-form__captcha">
                      <div class="cus-contact-form__captcha-q">
                        <span class="cus-contact-form__captcha-text">{{ captchaQuestion }}</span>
                        <button type="button" class="cus-contact-form__captcha-reload" @click="newCaptcha" title="Refresh">
                          &#x21bb;
                        </button>
                      </div>
                      <div class="cus-contact-form__field">
                        <label>Captcha Answer <span class="req">*</span></label>
                        <input type="text" v-model="cf.captchaAns" placeholder="Your answer" required />
                      </div>
                    </div>
                  </div>

                  <!-- Status messages -->
                  <div class="col-12" v-if="contactMsg">
                    <p :class="contactSuccess ? 'cus-contact-form__success' : 'cus-contact-form__error'">{{ contactMsg }}</p>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="thm-btn" :disabled="sending">
                      {{ sending ? 'Sending…' : 'Send Message' }}
                      <span class="icon-up-right-arrow"></span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      <Footer1 />
    </div>

    <MobileNav />
    <SearchPopup />
    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';

// ─ Captcha
const captchaA        = ref(0);
const captchaB        = ref(0);
const captchaQuestion = ref('');
function newCaptcha() {
  captchaA.value = Math.floor(Math.random() * 10) + 1;
  captchaB.value = Math.floor(Math.random() * 10) + 1;
  captchaQuestion.value = `What is ${captchaA.value} + ${captchaB.value}?`;
  cf.value.captchaAns = '';
}
onMounted(() => newCaptcha());

// ─ Form
const cf             = ref({ name: '', envelope: '', message: '', captchaAns: '' });
const sending        = ref(false);
const contactMsg     = ref('');
const contactSuccess = ref(false);

async function submitContact() {
  contactMsg.value = '';
  const expected = captchaA.value + captchaB.value;
  if (parseInt(cf.value.captchaAns) !== expected) {
    contactMsg.value   = 'Incorrect captcha answer. Please try again.';
    contactSuccess.value = false;
    newCaptcha();
    return;
  }
  sending.value = true;
  try {
    const params = new URLSearchParams();
    params.append('name',       cf.value.name);
    params.append('envelope',   cf.value.envelope);
    params.append('message',    cf.value.message);
    params.append('captchaAns', cf.value.captchaAns);
    const res  = await fetch('https://www.custherds.com/contact-us/sendContact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await res.json();
    contactMsg.value     = data.msg || (data.status ? 'Message sent!' : 'Something went wrong.');
    contactSuccess.value = !!data.status;
    if (data.status) {
      cf.value = { name: '', envelope: '', message: '', captchaAns: '' };
      newCaptcha();
    }
  } catch {
    contactMsg.value   = 'Network error. Please try again.';
    contactSuccess.value = false;
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
/* ─── Section wrapper: dark background ─── */
.contact-page {
  background-color: #0a0a0a;
  color: #ffffff;
}

/* ─── Info Cards ─── */
.cus-contact-card {
  background: #1a1a1a;
  border: 1px solid #2e2e2e;
  border-radius: 14px;
  padding: 32px 28px;
  text-align: center;
  height: 100%;
  transition: box-shadow 0.25s, border-color 0.25s;
}
.cus-contact-card:hover {
  border-color: var(--thm-primary, #c9a84c);
  box-shadow: 0 8px 32px rgba(201,168,76,0.15);
}
.cus-contact-card__icon {
  display: inline-flex;
  font-size: 36px;
  color: var(--thm-primary, #c9a84c);
  margin-bottom: 16px;
}
.cus-contact-card h4 {
  font-size: 18px; font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}
.cus-contact-card p {
  font-size: 15px; color: #aaaaaa; margin: 0;
}
.cus-contact-card a {
  color: var(--thm-primary, #c9a84c);
  text-decoration: none; font-weight: 600;
}
.cus-contact-card a:hover { text-decoration: underline; }

/* ─── Section titles ─── */
.contact-page__section-title {
  font-size: 26px; font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
}

/* ─── Map ─── */
.cus-map-wrap {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

/* ─── Form fields ─── */
.cus-contact-form__field {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px;
}
.cus-contact-form__field label {
  font-size: 14px; font-weight: 600; color: #cccccc;
}
.cus-contact-form__field input,
.cus-contact-form__field textarea {
  background: #1e1e1e;
  border: 1px solid #333;
  color: #ffffff;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  transition: border 0.2s;
  outline: none;
  width: 100%;
}
.cus-contact-form__field input::placeholder,
.cus-contact-form__field textarea::placeholder { color: #666; }
.cus-contact-form__field input:focus,
.cus-contact-form__field textarea:focus {
  border-color: var(--thm-primary, #c9a84c);
}

/* ─── Captcha ─── */
.cus-contact-form__captcha {
  display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap;
}
.cus-contact-form__captcha-q {
  display: flex; align-items: center; gap: 10px; white-space: nowrap;
}
.cus-contact-form__captcha-text {
  font-size: 20px; font-weight: 700; color: #ffffff;
}
.cus-contact-form__captcha-reload {
  background: #2a2a2a; border: 1px solid #444;
  color: #ccc; border-radius: 50%;
  width: 32px; height: 32px; font-size: 18px;
  cursor: pointer; transition: background 0.2s, color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.cus-contact-form__captcha-reload:hover {
  background: var(--thm-primary, #c9a84c); color: #fff; border-color: transparent;
}
.cus-contact-form__captcha .cus-contact-form__field { flex: 1; min-width: 160px; margin: 0; }

.req { color: #e53e3e; }

.cus-contact-form__success {
  color: #68d391; font-size: 14px;
  background: rgba(104,211,145,0.1);
  border: 1px solid rgba(104,211,145,0.3);
  border-radius: 6px; padding: 10px 14px; margin: 0;
}
.cus-contact-form__error {
  color: #fc8181; font-size: 14px;
  background: rgba(252,129,129,0.1);
  border: 1px solid rgba(252,129,129,0.3);
  border-radius: 6px; padding: 10px 14px; margin: 0;
}
.thm-btn[disabled] { opacity: 0.45; cursor: not-allowed; }

@media (max-width: 768px) {
  .cus-contact-form__captcha { flex-direction: column; align-items: stretch; }
}
</style>
