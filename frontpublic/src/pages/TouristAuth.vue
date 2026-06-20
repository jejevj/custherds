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
        :title="mode === 'login' ? 'Welcome Back, Traveller' : 'Join as a Traveller'"
        subtitle="Explore Bali with a trusted local guide by your side."
      />

      <section class="auth-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">

              <!-- TAB TOGGLE -->
              <div class="ta-tabs">
                <button :class="['ta-tab', { active: mode === 'register' }]" @click="mode = 'register'">
                  ✈️ Create Account
                </button>
                <button :class="['ta-tab', { active: mode === 'login' }]" @click="mode = 'login'">
                  🔑 Sign In
                </button>
              </div>

              <!-- ===== REGISTER ===== -->
              <div v-show="mode === 'register'" class="ta-card">
                <div class="ta-hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="ta-hero__overlay"></div>
                  <div class="ta-hero__content">
                    <h2>Plan Your Perfect Bali Trip</h2>
                    <p>Create a free account to connect directly with verified local guides.</p>
                    <div class="ta-hero__perks">
                      <span>✓ Free to join</span>
                      <span>✓ Chat guides via WhatsApp</span>
                      <span>✓ No booking fees</span>
                    </div>
                  </div>
                </div>

                <div class="ta-form-wrap">
                  <form @submit.prevent="submitRegister">

                    <div class="ta-section-label">Your Details</div>

                    <div class="ta-field">
                      <label>Full Name <span class="req">*</span></label>
                      <input type="text" v-model="rf.name" placeholder="e.g. John Smith" required />
                    </div>

                    <div class="ta-field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" v-model="rf.email" placeholder="your@email.com" required />
                    </div>

                    <div class="ta-field">
                      <label>Phone / WhatsApp</label>
                      <input type="tel" v-model="rf.phone" placeholder="e.g. +44 7911 123456" />
                    </div>

                    <div class="ta-field">
                      <label>Nationality <span class="req">*</span></label>
                      <input type="text" v-model="rf.nationality" placeholder="e.g. British" required />
                    </div>

                    <div class="ta-field">
                      <label>Planned Visit Date</label>
                      <input type="date" v-model="rf.visit_date" :min="today" />
                    </div>

                    <div class="ta-field">
                      <label>Area of Interest</label>
                      <select v-model="rf.area_interest">
                        <option value="">Select area (optional)</option>
                        <optgroup label="South Bali">
                          <option>Canggu</option><option>Seminyak</option>
                          <option>Kuta</option><option>Uluwatu</option>
                          <option>Jimbaran</option><option>Nusa Dua</option>
                        </optgroup>
                        <optgroup label="Central Bali">
                          <option>Ubud</option><option>Tegallalang</option>
                          <option>Sidemen</option><option>Tabanan</option>
                        </optgroup>
                        <optgroup label="North Bali">
                          <option>Lovina</option><option>Munduk</option>
                        </optgroup>
                        <optgroup label="East Bali">
                          <option>Amed</option><option>Candidasa</option>
                        </optgroup>
                        <optgroup label="Islands">
                          <option>Nusa Penida</option><option>Nusa Lembongan</option>
                        </optgroup>
                      </select>
                    </div>

                    <div class="ta-field-row">
                      <div class="ta-field">
                        <label>Password <span class="req">*</span></label>
                        <input type="password" v-model="rf.password" placeholder="Min. 8 characters" minlength="8" required />
                      </div>
                      <div class="ta-field">
                        <label>Confirm Password <span class="req">*</span></label>
                        <input type="password" v-model="rf.password_confirm" placeholder="Repeat password" minlength="8" required />
                      </div>
                    </div>

                    <p class="ta-error" v-if="registerError">{{ registerError }}</p>
                    <p class="ta-success" v-if="registerSuccess">{{ registerSuccess }}</p>

                    <div class="ta-actions">
                      <button type="submit" class="thm-btn" :disabled="loading">
                        {{ loading ? 'Creating account…' : 'Create Free Account' }}
                        <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>

                    <p class="ta-terms">
                      By registering you agree to our
                      <a href="https://www.custherds.com/termCondition" target="_blank">Terms &amp; Platform Rules</a>.
                    </p>
                    <p class="ta-switch">
                      Already have an account?
                      <a href="#" @click.prevent="mode = 'login'">Sign in here</a>
                    </p>
                  </form>
                </div>
              </div>

              <!-- ===== LOGIN ===== -->
              <div v-show="mode === 'login'" class="ta-card">
                <div class="ta-hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page4.webp)' }">
                  <div class="ta-hero__overlay"></div>
                  <div class="ta-hero__content">
                    <h2>Welcome Back</h2>
                    <p>Sign in to chat with your favourite Bali guides.</p>
                  </div>
                </div>

                <div class="ta-form-wrap">
                  <form @submit.prevent="submitLogin">
                    <div class="ta-field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" v-model="lf.email" placeholder="your@email.com" required />
                    </div>
                    <div class="ta-field">
                      <label>Password <span class="req">*</span></label>
                      <input type="password" v-model="lf.password" placeholder="Your password" required />
                    </div>

                    <div class="ta-forgot">
                      <a href="https://www.custherds.com/register/forgotPassword" target="_blank">Forgot password?</a>
                    </div>

                    <p class="ta-error" v-if="loginError">{{ loginError }}</p>

                    <!-- Coming soon notice -->
                    <div class="ta-coming-soon">
                      🔧 Tourist login is coming soon. Stay tuned!
                    </div>

                    <div class="ta-actions">
                      <button type="submit" class="thm-btn" disabled>
                        Sign In — Coming Soon
                        <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>

                    <p class="ta-switch">
                      Don&rsquo;t have an account?
                      <a href="#" @click.prevent="mode = 'register'">Register free</a>
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';

const route = useRoute();

// Default mode based on route path
const mode = ref(route.path === '/tourist/login' ? 'login' : 'register');
const loading = ref(false);

const today = computed(() => new Date().toISOString().split('T')[0]);

// ── Register form ─────────────────────────────────────────────
const rf = ref({
  name: '', email: '', phone: '', nationality: '',
  visit_date: '', area_interest: '', password: '', password_confirm: ''
});
const registerError   = ref('');
const registerSuccess = ref('');

async function submitRegister() {
  registerError.value   = '';
  registerSuccess.value = '';
  if (rf.value.password !== rf.value.password_confirm) {
    registerError.value = 'Passwords do not match.'; return;
  }
  loading.value = true;
  try {
    const fd = new FormData();
    Object.entries(rf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fd.append('user_type', '3'); // 3 = tourist
    const res = await fetch('https://www.custherds.com/register/saveTourist', { method: 'POST', body: fd });
    if (res.ok) {
      registerSuccess.value = '🎉 Account created! Login will be available soon.';
      rf.value = { name: '', email: '', phone: '', nationality: '', visit_date: '', area_interest: '', password: '', password_confirm: '' };
    } else {
      registerError.value = 'Registration failed. This email may already be in use.';
    }
  } catch {
    registerError.value = 'Network error. Please try again.';
  } finally {
    loading.value = false;
  }
}

// ── Login — disabled until backend is ready ───────────────────
const lf = ref({ email: '', password: '' });
const loginError = ref('');

function submitLogin() {
  // Login intentionally disabled — backend endpoint not ready yet.
  loginError.value = 'Tourist login is not yet available. Please check back soon.';
}
</script>

<style scoped>
/* Tabs */
.ta-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.ta-tab {
  flex: 1;
  padding: 13px 16px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.22s;
  font-family: inherit;
}
.ta-tab.active,
.ta-tab:hover {
  border-color: var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c);
  background: #fffaf0;
}

/* Card */
.ta-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.10);
}

/* Hero banner */
.ta-hero {
  position: relative;
  background-size: cover;
  background-position: center;
  padding: 52px 36px;
}
.ta-hero__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.62);
}
.ta-hero__content {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
}
.ta-hero__content h2 {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 10px;
}
.ta-hero__content p {
  font-size: 15px;
  opacity: 0.85;
  margin-bottom: 16px;
}
.ta-hero__perks {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.ta-hero__perks span {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

/* Form wrap */
.ta-form-wrap {
  background: #fff;
  padding: 36px 32px;
}
.ta-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #bbb;
  margin-bottom: 18px;
}

/* Fields */
.ta-field {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ta-field label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.ta-field input,
.ta-field select {
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
  background: #fafafa;
  width: 100%;
  font-family: inherit;
}
.ta-field input:focus,
.ta-field select:focus {
  border-color: var(--thm-primary, #c9a84c);
  background: #fff;
}
.ta-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 520px) { .ta-field-row { grid-template-columns: 1fr; } }
.req { color: #e53e3e; }

/* Messages */
.ta-error {
  color: #e53e3e;
  font-size: 13px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.ta-success {
  color: #276749;
  font-size: 13px;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

/* Coming soon notice */
.ta-coming-soon {
  background: #fffbea;
  border: 1px solid #f6e05e;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #744210;
  margin-bottom: 16px;
  text-align: center;
}

/* Actions */
.ta-actions { margin-top: 8px; margin-bottom: 16px; }
.ta-actions .thm-btn { width: 100%; display: block; text-align: center; padding: 14px; }
.ta-actions .thm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ta-forgot { text-align: right; margin-bottom: 4px; }
.ta-forgot a { font-size: 13px; color: var(--thm-primary, #c9a84c); text-decoration: none; }
.ta-terms { font-size: 12px; color: #aaa; margin-bottom: 10px; }
.ta-terms a { color: var(--thm-primary, #c9a84c); }
.ta-switch { font-size: 14px; color: #666; text-align: center; }
.ta-switch a { color: var(--thm-primary, #c9a84c); font-weight: 600; text-decoration: none; }
.ta-switch a:hover { text-decoration: underline; }
</style>
