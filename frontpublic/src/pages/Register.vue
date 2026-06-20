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
        title="Partner Registration"
        subtitle="Join the Herd. Grow. Earn. Together."
      />

      <section class="auth-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-8">

              <!-- REGISTER SECTION -->
              <div v-if="mode === 'register'" class="auth-page__box wow fadeInUp" data-wow-delay="100ms">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Partner Registration</h2>
                    <p>Become a Custherds Partner — Join now and start earning while sharing the best of Bali!</p>
                  </div>
                </div>

                <div class="auth-page__form-wrap">
                  <form @submit.prevent="submitRegister" enctype="multipart/form-data">

                    <h4 class="auth-page__section-title">1. User Account Details</h4>
                    <hr>

                    <div class="auth-page__field">
                      <label>Full Name of Contact Person <span class="text-danger">*</span></label>
                      <input type="text" v-model="form.user_name" placeholder="Enter your full name" required />
                    </div>

                    <div class="auth-page__field">
                      <label>Email Address <span class="text-danger">*</span></label>
                      <input type="email" v-model="form.user_email" placeholder="Enter email address" required />
                    </div>

                    <div class="auth-page__field">
                      <label>Phone Number</label>
                      <input type="tel" v-model="form.user_phone" placeholder="e.g., +628123456789" />
                    </div>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Password <span class="text-danger">*</span></label>
                          <input type="password" v-model="form.user_password" placeholder="Create a password" minlength="8" required />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Confirm Password <span class="text-danger">*</span></label>
                          <input type="password" v-model="form.pass_confirm" placeholder="Confirm password" minlength="8" required />
                        </div>
                      </div>
                    </div>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Instagram Link</label>
                          <input type="url" v-model="form.ig_link" placeholder="https://www.instagram.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Facebook Link</label>
                          <input type="url" v-model="form.fb_link" placeholder="https://www.facebook.com/..." />
                        </div>
                      </div>
                    </div>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>YouTube Link</label>
                          <input type="url" v-model="form.yt_link" placeholder="https://www.youtube.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>TikTok Link</label>
                          <input type="url" v-model="form.tiktok_link" placeholder="https://www.tiktok.com/@..." />
                        </div>
                      </div>
                    </div>

                    <h4 class="auth-page__section-title mt-4">2. Guide Profile Details</h4>
                    <hr>

                    <div class="auth-page__field">
                      <label>Nationality</label>
                      <input type="text" v-model="form.guide_nationality" placeholder="Your country of origin" />
                    </div>

                    <div class="auth-page__field">
                      <label>Upload License</label>
                      <small class="auth-page__hint">File ext: jpg/png, max 2MB</small>
                      <input type="file" accept=".jpg,.jpeg,.png" @change="onFileChange" />
                    </div>

                    <p class="auth-page__error" v-if="errorMsg">{{ errorMsg }}</p>

                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn">
                        Register as Partner <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>

                    <p class="auth-page__terms">
                      By submitting you confirm that you have read and agree to the
                      <a href="https://www.custherds.com/termCondition" target="_blank">Terms &amp; Platform Rules</a>.
                    </p>

                    <p class="auth-page__switch">
                      Already have an account?
                      <a href="#" @click.prevent="mode = 'login'">Login here</a>
                    </p>

                  </form>
                </div>
              </div>

              <!-- LOGIN SECTION -->
              <div v-if="mode === 'login'" class="auth-page__box wow fadeInUp" data-wow-delay="100ms">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Partner Login</h2>
                    <p>Login to manage your account</p>
                  </div>
                </div>

                <div class="auth-page__form-wrap">
                  <form @submit.prevent="submitLogin">

                    <div class="auth-page__field">
                      <label>Email</label>
                      <input type="email" v-model="loginForm.email" placeholder="Enter your email" required />
                    </div>

                    <div class="auth-page__field">
                      <label>Password</label>
                      <input type="password" v-model="loginForm.password" placeholder="Enter your password" required />
                    </div>

                    <div class="auth-page__forgot">
                      <a href="https://www.custherds.com/register/forgotPassword" target="_blank">Forgot your password?</a>
                    </div>

                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn">
                        Login <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>

                    <p class="auth-page__switch">
                      Don&rsquo;t have an account?
                      <a href="#" @click.prevent="mode = 'register'">Register here</a>
                    </p>

                  </form>
                </div>
              </div>

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
import { ref } from 'vue';
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';

const mode = ref('register');
const errorMsg = ref('');

const form = ref({
  user_name: '', user_email: '', user_phone: '',
  user_password: '', pass_confirm: '',
  ig_link: '', fb_link: '', yt_link: '', tiktok_link: '',
  guide_nationality: '', guide_certificate: null
});

const loginForm = ref({ email: '', password: '' });

function onFileChange(e) {
  form.value.guide_certificate = e.target.files[0];
}

function submitRegister() {
  if (form.value.user_password !== form.value.pass_confirm) {
    errorMsg.value = 'Passwords do not match.';
    return;
  }
  errorMsg.value = '';
  const fd = new FormData();
  Object.entries(form.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
  fd.append('user_type', '1');
  fetch('https://www.custherds.com/register/saveRegistration', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Registration submitted!') : alert('Something went wrong.'))
    .catch(() => alert('Network error. Please try again.'));
}

function submitLogin() {
  const fd = new FormData();
  fd.append('uemail', loginForm.value.email);
  fd.append('password', loginForm.value.password);
  fetch('https://www.custherds.com/loginGuide/auth', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Login successful!') : alert('Invalid credentials.'))
    .catch(() => alert('Network error. Please try again.'));
}
</script>

<style scoped>
.auth-page__box {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.10);
}

.auth-page__hero {
  position: relative;
  background-size: cover;
  background-position: center;
  padding: 60px 40px;
}

.auth-page__hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
}

.auth-page__hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.auth-page__hero-content h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}

.auth-page__hero-content p {
  font-size: 16px;
  opacity: 0.85;
}

.auth-page__form-wrap {
  background: #fff;
  padding: 40px;
}

.auth-page__section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--thm-black, #1a1a1a);
  margin-bottom: 12px;
}

.auth-page__field {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-page__field label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.auth-page__field input {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  transition: border 0.2s;
  outline: none;
  width: 100%;
}

.auth-page__field input:focus {
  border-color: var(--thm-primary, #c9a84c);
}

.auth-page__hint {
  font-size: 12px;
  color: #999;
}

.auth-page__actions {
  margin-top: 32px;
  margin-bottom: 20px;
}

.auth-page__actions .thm-btn {
  width: 100%;
  text-align: center;
  display: block;
  padding: 14px;
}

.auth-page__forgot {
  text-align: right;
  margin-bottom: 8px;
}

.auth-page__forgot a {
  font-size: 13px;
  color: var(--thm-primary, #c9a84c);
  text-decoration: none;
}

.auth-page__terms {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}

.auth-page__terms a {
  color: var(--thm-primary, #c9a84c);
}

.auth-page__switch {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 8px;
}

.auth-page__switch a {
  color: var(--thm-primary, #c9a84c);
  font-weight: 600;
  text-decoration: none;
}

.auth-page__switch a:hover { text-decoration: underline; }

.auth-page__error {
  color: #e53e3e;
  font-size: 13px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .auth-page__form-wrap { padding: 24px 20px; }
  .auth-page__hero { padding: 40px 20px; }
}
</style>
