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
        title="Welcome Back"
        subtitle="Login to your Custherds account"
      />

      <section class="login-page py-5">
        <div class="container">

          <!-- ── Tourist Login Form ── -->
          <div class="row justify-content-center mb-5">
            <div class="col-12 col-lg-5">
              <div class="lp-card lp-card--form">
                <div class="lp-card__icon-wrap">
                  <span class="icon-user"></span>
                </div>
                <h3 class="lp-card__title">Tourist / Traveller</h3>
                <p class="lp-card__desc">Login to explore guides, browse experiences, and manage your trips.</p>

                <form @submit.prevent="submitLogin" class="lp-form">
                  <div class="lp-form__field">
                    <label>Email <span class="req">*</span></label>
                    <input type="email" v-model="form.email" placeholder="Enter your email" required />
                  </div>
                  <div class="lp-form__field">
                    <label>Password <span class="req">*</span></label>
                    <div class="lp-form__pw-wrap">
                      <input :type="showPw ? 'text' : 'password'" v-model="form.password" placeholder="Enter your password" required />
                      <button type="button" class="lp-form__pw-toggle" @click="showPw = !showPw" tabindex="-1">
                        <i :class="showPw ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="lp-form__status" v-if="loginMsg">
                    <p :class="loginOk ? 'lp-form__success' : 'lp-form__error'">{{ loginMsg }}</p>
                  </div>

                  <button type="submit" class="thm-btn lp-form__submit" :disabled="loading">
                    {{ loading ? 'Logging in…' : 'Login' }}
                    <span class="icon-up-right-arrow"></span>
                  </button>
                </form>

                <p class="lp-card__register">
                  Don&rsquo;t have an account?
                  <router-link to="/tourist/register">Register here</router-link>
                </p>
              </div>
            </div>
          </div>

          <!-- ── Divider ── -->
          <div class="row justify-content-center mb-4">
            <div class="col-12 col-lg-5">
              <div class="lp-divider"><span>Are you a Partner or Vendor?</span></div>
            </div>
          </div>

          <!-- ── Vendor & Guide redirect cards ── -->
          <div class="row justify-content-center g-4">
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="lp-card lp-card--redirect">
                <div class="lp-card__icon-wrap">
                  <span class="icon-person"></span>
                </div>
                <h4 class="lp-card__title">Herd Guide</h4>
                <p class="lp-card__desc">Access your guide dashboard, manage bookings, and track your commissions.</p>
                <a
                  href="https://partners-custherds.ourtestcloud.my.id/guide/login"
                  class="thm-btn lp-card__btn"
                >
                  Login as Guide <span class="icon-up-right-arrow"></span>
                </a>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-4">
              <div class="lp-card lp-card--redirect">
                <div class="lp-card__icon-wrap">
                  <span class="icon-trading"></span>
                </div>
                <h4 class="lp-card__title">Business Vendor</h4>
                <p class="lp-card__desc">Manage your listings, view affiliate activity, and grow your customer base.</p>
                <a
                  href="https://partners-custherds.ourtestcloud.my.id/vendor/login"
                  class="thm-btn lp-card__btn"
                >
                  Login as Vendor <span class="icon-up-right-arrow"></span>
                </a>
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
import Preloader   from '@/components/common/Preloader.vue';
import ChatPopup   from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav   from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo   from '@/components/layout/header/HeaderTwo.vue';
import PageHeader  from '@/components/common/PageHeader.vue';
import Footer1     from '@/components/layout/footer/Footer1.vue';

const form     = ref({ email: '', password: '' });
const showPw   = ref(false);
const loading  = ref(false);
const loginMsg = ref('');
const loginOk  = ref(false);

async function submitLogin() {
  loginMsg.value = '';
  loading.value  = true;
  try {
    const params = new URLSearchParams();
    params.append('email',    form.value.email);
    params.append('password', form.value.password);
    const res  = await fetch('https://www.custherds.com/tourist/login/doLogin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });
    const data = await res.json();
    if (data.status) {
      loginOk.value  = true;
      loginMsg.value = data.msg || 'Login successful! Redirecting…';
      if (data.redirect) {
        setTimeout(() => { window.location.href = data.redirect; }, 800);
      }
    } else {
      loginOk.value  = false;
      loginMsg.value = data.msg || 'Invalid email or password.';
    }
  } catch {
    loginOk.value  = false;
    loginMsg.value = 'Network error. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  background-color: #0a0a0a;
  min-height: 60vh;
}

/* ─── Card wrapper ─── */
.lp-card {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.lp-card:hover {
  border-color: var(--thm-primary, #c9a84c);
  box-shadow: 0 8px 32px rgba(201,168,76,0.12);
}

.lp-card__icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--thm-primary, #c9a84c);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.lp-card__icon-wrap span {
  font-size: 26px;
  color: #fff;
}

.lp-card__title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
}
.lp-card__desc {
  font-size: 14px;
  color: #999;
  line-height: 1.75;
  margin-bottom: 24px;
  flex: 1;
}
.lp-card__register {
  margin-top: 20px;
  font-size: 14px;
  color: #888;
}
.lp-card__register a {
  color: var(--thm-primary, #c9a84c);
  font-weight: 600;
  text-decoration: none;
}
.lp-card__register a:hover { text-decoration: underline; }

.lp-card__btn {
  width: 100%;
  margin-top: auto;
  text-align: center;
}

/* ─── Form ─── */
.lp-form {
  width: 100%;
  text-align: left;
}
.lp-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.lp-form__field label {
  font-size: 13px;
  font-weight: 600;
  color: #ccc;
}
.lp-form__field input {
  background: #1e1e1e;
  border: 1px solid #333;
  color: #fff;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 15px;
  outline: none;
  width: 100%;
  transition: border 0.2s;
}
.lp-form__field input::placeholder { color: #555; }
.lp-form__field input:focus { border-color: var(--thm-primary, #c9a84c); }

.lp-form__pw-wrap {
  position: relative;
}
.lp-form__pw-wrap input { padding-right: 44px; }
.lp-form__pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 15px;
  padding: 0;
}
.lp-form__pw-toggle:hover { color: var(--thm-primary, #c9a84c); }

.lp-form__submit {
  width: 100%;
  text-align: center;
  margin-top: 4px;
}
.lp-form__submit[disabled] { opacity: 0.45; cursor: not-allowed; }

.lp-form__success {
  color: #68d391;
  font-size: 13px;
  background: rgba(104,211,145,0.1);
  border: 1px solid rgba(104,211,145,0.3);
  border-radius: 6px;
  padding: 9px 12px;
  margin-bottom: 12px;
}
.lp-form__error {
  color: #fc8181;
  font-size: 13px;
  background: rgba(252,129,129,0.1);
  border: 1px solid rgba(252,129,129,0.3);
  border-radius: 6px;
  padding: 9px 12px;
  margin-bottom: 12px;
}
.req { color: #e53e3e; }

/* ─── Divider ─── */
.lp-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #444;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.lp-divider::before,
.lp-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #2a2a2a;
}
.lp-divider span { white-space: nowrap; color: #555; }
</style>
