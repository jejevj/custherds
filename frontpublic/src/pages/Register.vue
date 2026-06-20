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
        :title="pageTitle"
        subtitle="Join the Herd. Grow. Earn. Together."
      />

      <section class="auth-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-9">

              <!-- MODE TABS (only shown on register modes) -->
              <div v-if="mode !== 'login'" class="auth-page__tabs wow fadeInDown" data-wow-delay="100ms">
                <button
                  :class="['auth-page__tab', { active: mode === 'partner' }]"
                  @click="mode = 'partner'">
                  <span class="icon-user"></span> Herd Partner
                </button>
                <button
                  :class="['auth-page__tab', { active: mode === 'vendor' }]"
                  @click="mode = 'vendor'">
                  <span class="icon-trading"></span> Business Vendor
                </button>
              </div>

              <!-- ===== PARTNER REGISTER ===== -->
              <div v-if="mode === 'partner'" class="auth-page__box wow fadeInUp" data-wow-delay="150ms">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Partner Registration</h2>
                    <p>Become a Custherds Partner — Join now and start earning while sharing the best of Bali!</p>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <form @submit.prevent="submitPartner" enctype="multipart/form-data">

                    <h4 class="auth-page__section-title">1. User Account Details</h4>
                    <hr />

                    <div class="auth-page__field">
                      <label>Full Name of Contact Person <span class="req">*</span></label>
                      <input type="text" v-model="pf.user_name" placeholder="Enter your full name" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" v-model="pf.user_email" placeholder="Enter email address" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Phone Number</label>
                      <input type="tel" v-model="pf.user_phone" placeholder="e.g., +628123456789" />
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Password <span class="req">*</span></label>
                          <input type="password" v-model="pf.user_password" placeholder="Create a password" minlength="8" required />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Confirm Password <span class="req">*</span></label>
                          <input type="password" v-model="pf.pass_confirm" placeholder="Confirm password" minlength="8" required />
                        </div>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Instagram Link</label>
                          <input type="url" v-model="pf.ig_link" placeholder="https://www.instagram.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Facebook Link</label>
                          <input type="url" v-model="pf.fb_link" placeholder="https://www.facebook.com/..." />
                        </div>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>YouTube Link</label>
                          <input type="url" v-model="pf.yt_link" placeholder="https://www.youtube.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>TikTok Link</label>
                          <input type="url" v-model="pf.tiktok_link" placeholder="https://www.tiktok.com/@..." />
                        </div>
                      </div>
                    </div>

                    <h4 class="auth-page__section-title mt-4">2. Guide Profile Details</h4>
                    <hr />

                    <div class="auth-page__field">
                      <label>Nationality</label>
                      <input type="text" v-model="pf.guide_nationality" placeholder="Your country of origin" />
                    </div>
                    <div class="auth-page__field">
                      <label>Upload License</label>
                      <small class="auth-page__hint">File ext: jpg/png, max 2MB</small>
                      <input type="file" accept=".jpg,.jpeg,.png" @change="e => pf.guide_certificate = e.target.files[0]" />
                    </div>

                    <p class="auth-page__error" v-if="partnerError">{{ partnerError }}</p>

                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn">Register as Partner <span class="icon-up-right-arrow"></span></button>
                    </div>
                    <p class="auth-page__terms">By submitting you confirm that you have read and agree to the <a href="https://www.custherds.com/termCondition" target="_blank">Terms &amp; Platform Rules</a>.</p>
                    <p class="auth-page__switch">Already have an account? <a href="#" @click.prevent="mode = 'login'">Login here</a></p>
                  </form>
                </div>
              </div>

              <!-- ===== VENDOR REGISTER ===== -->
              <div v-if="mode === 'vendor'" class="auth-page__box wow fadeInUp" data-wow-delay="150ms">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page4.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Business Vendor Registration</h2>
                    <p>Grow your business in Bali with zero upfront cost. We only earn when you earn.</p>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <form @submit.prevent="submitVendor">

                    <h4 class="auth-page__section-title">1. User Account Details</h4>
                    <hr />

                    <div class="auth-page__field">
                      <label>Full Name of Contact Person <span class="req">*</span></label>
                      <input type="text" v-model="vf.user_name" placeholder="Enter your full name" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" v-model="vf.user_email" placeholder="Enter email address" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Phone Number</label>
                      <input type="tel" v-model="vf.user_phone" placeholder="e.g., +628123456789" />
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Password <span class="req">*</span></label>
                          <input type="password" v-model="vf.user_password" placeholder="Create a password" minlength="8" required />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Confirm Password <span class="req">*</span></label>
                          <input type="password" v-model="vf.pass_confirm" placeholder="Confirm password" minlength="8" required />
                        </div>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Instagram Link</label>
                          <input type="url" v-model="vf.ig_link" placeholder="https://www.instagram.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Facebook Link</label>
                          <input type="url" v-model="vf.fb_link" placeholder="https://www.facebook.com/..." />
                        </div>
                      </div>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>YouTube Link</label>
                          <input type="url" v-model="vf.yt_link" placeholder="https://www.youtube.com/..." />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>TikTok Link</label>
                          <input type="url" v-model="vf.tiktok_link" placeholder="https://www.tiktok.com/@..." />
                        </div>
                      </div>
                    </div>

                    <h4 class="auth-page__section-title mt-4">2. Business Details</h4>
                    <hr />

                    <div class="auth-page__field">
                      <label>Business/Venue Name <span class="req">*</span></label>
                      <input type="text" v-model="vf.vendor_business_name" placeholder="Enter business name" required />
                    </div>

                    <div class="auth-page__field">
                      <label>Business Category <span class="req">*</span></label>
                      <select v-model="vf.vendor_category" required>
                        <option value="">Select Category</option>
                        <optgroup label="Activities">
                          <option value="39">Adventures (ATV, Waterfalls, Surfing)</option>
                          <option value="41">Culture &amp; Tradition</option>
                          <option value="38">Tours &amp; Day Trips</option>
                          <option value="40">Workshops &amp; Classes</option>
                        </optgroup>
                        <optgroup label="Business &amp; Services">
                          <option value="48">Coworking Spaces</option>
                          <option value="51">Digital &amp; Media Services</option>
                          <option value="49">Real Estate</option>
                          <option value="50">Visa &amp; Legal Help</option>
                        </optgroup>
                        <optgroup label="Eat &amp; Drink">
                          <option value="29">Bars</option>
                          <option value="28">Beach Clubs</option>
                          <option value="26">Cafés</option>
                          <option value="27">Restaurants</option>
                        </optgroup>
                        <optgroup label="Events">
                          <option value="47">Event Organizers</option>
                          <option value="46">Photoshoots</option>
                          <option value="45">Weddings &amp; Parties</option>
                        </optgroup>
                        <optgroup label="Shopping">
                          <option value="35">Art &amp; Craft</option>
                          <option value="34">Fashion &amp; Boutique</option>
                          <option value="36">Jewelry</option>
                          <option value="37">Souvenirs</option>
                        </optgroup>
                        <optgroup label="Stay">
                          <option value="24">Guesthouses</option>
                          <option value="23">Hotels</option>
                          <option value="25">Retreats</option>
                          <option value="22">Villas</option>
                        </optgroup>
                        <optgroup label="Transport">
                          <option value="44">Airport Transfer</option>
                          <option value="43">Private Drivers</option>
                          <option value="42">Scooter &amp; Car Rental</option>
                        </optgroup>
                        <optgroup label="Wellness">
                          <option value="31">Beauty &amp; Salon</option>
                          <option value="33">Healing &amp; Therapy</option>
                          <option value="30">Spas &amp; Massage</option>
                          <option value="32">Yoga &amp; Fitness</option>
                        </optgroup>
                      </select>
                    </div>

                    <div class="auth-page__field">
                      <label>Business Location Area <span class="req">*</span></label>
                      <select v-model="vf.vendor_area" required>
                        <option value="">Select Area</option>
                        <optgroup label="Central Bali">
                          <option value="12">Sidemen</option>
                          <option value="13">Tabanan</option>
                          <option value="11">Tegallalang</option>
                          <option value="10">Ubud</option>
                        </optgroup>
                        <optgroup label="East Bali">
                          <option value="17">Amed</option>
                          <option value="18">Candidasa</option>
                        </optgroup>
                        <optgroup label="Islands">
                          <option value="21">Nusa Ceningan</option>
                          <option value="20">Nusa Lembongan</option>
                          <option value="19">Nusa Penida</option>
                        </optgroup>
                        <optgroup label="North Bali">
                          <option value="14">Lovina</option>
                          <option value="15">Munduk</option>
                          <option value="16">Singaraja</option>
                        </optgroup>
                        <optgroup label="South Bali">
                          <option value="1">Canggu</option>
                          <option value="6">Jimbaran</option>
                          <option value="5">Kuta</option>
                          <option value="4">Legian</option>
                          <option value="8">Nusa Dua</option>
                          <option value="2">Pererenan</option>
                          <option value="3">Seminyak</option>
                          <option value="9">Tanah Lot</option>
                          <option value="7">Uluwatu</option>
                        </optgroup>
                      </select>
                    </div>

                    <div class="auth-page__field">
                      <label>Physical Address</label>
                      <textarea v-model="vf.vendor_location" rows="3" placeholder="Street address in Bali"></textarea>
                    </div>
                    <div class="auth-page__field">
                      <label>Contact Person Name (on-site)</label>
                      <input type="text" v-model="vf.vendor_contact_person" placeholder="Name of person guides can ask for" />
                    </div>
                    <div class="auth-page__field">
                      <label>Website</label>
                      <input type="text" v-model="vf.vendor_website" placeholder="Vendor website address" />
                    </div>
                    <div class="auth-page__field">
                      <label>Short Description / Tagline</label>
                      <textarea v-model="vf.vendor_short_description" rows="3" placeholder="A brief description for guides to understand your business."></textarea>
                    </div>
                    <div class="auth-page__field">
                      <label>Business Operational Hours</label>
                      <textarea v-model="vf.vendor_opening_hours" rows="3" placeholder="e.g., Mon–Sun 09:00–22:00"></textarea>
                    </div>
                    <div class="auth-page__field">
                      <label>Minimum Spend</label>
                      <input type="number" v-model="vf.vendor_min_spend" placeholder="Minimum spend amount" />
                    </div>
                    <div class="auth-page__field">
                      <label>Cashback Percentage <span class="req">*</span></label>
                      <input type="number" v-model="vf.vendor_cashback_percent" placeholder="e.g., 10" min="5" max="100" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Where did you hear about Custherds?</label>
                      <textarea v-model="vf.vendor_know_from" rows="3" placeholder="How did you find us?"></textarea>
                    </div>

                    <p class="auth-page__error" v-if="vendorError">{{ vendorError }}</p>

                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn">Register Business Vendor <span class="icon-up-right-arrow"></span></button>
                    </div>
                    <input type="hidden" name="user_type" value="2" />
                    <p class="auth-page__terms">By submitting you confirm that you have read and agree to the <a href="https://www.custherds.com/termCondition" target="_blank">Terms &amp; Platform Rules</a>.</p>
                    <p class="auth-page__switch">Already have an account? <a href="#" @click.prevent="mode = 'login'">Login here</a></p>
                  </form>
                </div>
              </div>

              <!-- ===== LOGIN ===== -->
              <div v-if="mode === 'login'" class="auth-page__box wow fadeInUp" data-wow-delay="150ms">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Welcome Back</h2>
                    <p>Login to your Custherds account</p>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <div class="auth-page__login-type">
                    <button :class="['auth-page__type-btn', { active: loginType === 'partner' }]" @click="loginType = 'partner'">Herd Partner</button>
                    <button :class="['auth-page__type-btn', { active: loginType === 'vendor' }]" @click="loginType = 'vendor'">Business Vendor</button>
                  </div>
                  <form @submit.prevent="submitLogin">
                    <div class="auth-page__field">
                      <label>Email</label>
                      <input type="email" v-model="lf.email" placeholder="Enter your email" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Password</label>
                      <input type="password" v-model="lf.password" placeholder="Enter your password" required />
                    </div>
                    <div class="auth-page__forgot">
                      <a href="https://www.custherds.com/register/forgotPassword" target="_blank">Forgot your password?</a>
                    </div>
                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn">Login <span class="icon-up-right-arrow"></span></button>
                    </div>
                    <p class="auth-page__switch">Don&rsquo;t have an account? <a href="#" @click.prevent="mode = 'partner'">Register here</a></p>
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
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';

const mode = ref('partner'); // 'partner' | 'vendor' | 'login'
const loginType = ref('partner'); // 'partner' | 'vendor'
const partnerError = ref('');
const vendorError = ref('');

const pageTitle = computed(() => {
  if (mode.value === 'login') return 'Welcome Back';
  if (mode.value === 'vendor') return 'Business Vendor Registration';
  return 'Partner Registration';
});

const pf = ref({
  user_name: '', user_email: '', user_phone: '',
  user_password: '', pass_confirm: '',
  ig_link: '', fb_link: '', yt_link: '', tiktok_link: '',
  guide_nationality: '', guide_certificate: null
});

const vf = ref({
  user_name: '', user_email: '', user_phone: '',
  user_password: '', pass_confirm: '',
  ig_link: '', fb_link: '', yt_link: '', tiktok_link: '',
  vendor_business_name: '', vendor_category: '', vendor_area: '',
  vendor_location: '', vendor_contact_person: '', vendor_website: '',
  vendor_short_description: '', vendor_opening_hours: '',
  vendor_min_spend: '', vendor_cashback_percent: '', vendor_know_from: ''
});

const lf = ref({ email: '', password: '' });

function submitPartner() {
  if (pf.value.user_password !== pf.value.pass_confirm) {
    partnerError.value = 'Passwords do not match.'; return;
  }
  partnerError.value = '';
  const fd = new FormData();
  Object.entries(pf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
  fd.append('user_type', '1');
  fetch('https://www.custherds.com/register/saveRegistration', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Registration submitted!') : alert('Something went wrong.'))
    .catch(() => alert('Network error. Please try again.'));
}

function submitVendor() {
  if (vf.value.user_password !== vf.value.pass_confirm) {
    vendorError.value = 'Passwords do not match.'; return;
  }
  vendorError.value = '';
  const fd = new FormData();
  Object.entries(vf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
  fd.append('user_type', '2');
  fetch('https://www.custherds.com/register/saveRegistration', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Registration submitted!') : alert('Something went wrong.'))
    .catch(() => alert('Network error. Please try again.'));
}

function submitLogin() {
  const endpoint = loginType.value === 'vendor'
    ? 'https://www.custherds.com/loginVendor/auth'
    : 'https://www.custherds.com/loginGuide/auth';
  const fd = new FormData();
  fd.append('uemail', lf.value.email);
  fd.append('password', lf.value.password);
  fetch(endpoint, { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Login successful!') : alert('Invalid credentials.'))
    .catch(() => alert('Network error. Please try again.'));
}
</script>

<style scoped>
/* Tabs */
.auth-page__tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.auth-page__tab {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.auth-page__tab.active,
.auth-page__tab:hover {
  border-color: var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c);
  background: #fffaf0;
}

/* Login type toggle */
.auth-page__login-type {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
}
.auth-page__type-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #777;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-page__type-btn.active,
.auth-page__type-btn:hover {
  border-color: var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c);
  background: #fffaf0;
}

/* Card box */
.auth-page__box {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.10);
}

/* Hero banner */
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

/* Form wrap */
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

/* Fields */
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
.auth-page__field input,
.auth-page__field select,
.auth-page__field textarea {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  transition: border 0.2s;
  outline: none;
  width: 100%;
  background: #fff;
}
.auth-page__field input:focus,
.auth-page__field select:focus,
.auth-page__field textarea:focus {
  border-color: var(--thm-primary, #c9a84c);
}
.auth-page__hint { font-size: 12px; color: #999; }
.req { color: #e53e3e; }

/* Actions */
.auth-page__actions { margin-top: 32px; margin-bottom: 20px; }
.auth-page__actions .thm-btn {
  width: 100%; text-align: center; display: block; padding: 14px;
}
.auth-page__forgot { text-align: right; margin-bottom: 8px; }
.auth-page__forgot a { font-size: 13px; color: var(--thm-primary, #c9a84c); text-decoration: none; }
.auth-page__terms { font-size: 12px; color: #888; margin-bottom: 12px; }
.auth-page__terms a { color: var(--thm-primary, #c9a84c); }
.auth-page__switch { font-size: 14px; color: #666; text-align: center; margin-top: 8px; }
.auth-page__switch a { color: var(--thm-primary, #c9a84c); font-weight: 600; text-decoration: none; }
.auth-page__switch a:hover { text-decoration: underline; }
.auth-page__error {
  color: #e53e3e; font-size: 13px; background: #fff5f5;
  border: 1px solid #fed7d7; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;
}

@media (max-width: 768px) {
  .auth-page__form-wrap { padding: 24px 16px; }
  .auth-page__hero { padding: 40px 20px; }
  .auth-page__tabs { flex-direction: column; }
}
</style>
