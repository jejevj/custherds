<template>
  <div>
    <Preloader />
    <ChatPopup />
    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>
    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />
      <PageHeader :title="pageTitle" subtitle="Join the Herd. Grow. Earn. Together." />

      <section class="auth-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div :class="mode === 'tourist' ? 'col-12 col-lg-7' : 'col-12 col-lg-9'">

              <!-- MODE TABS -->
              <div v-show="mode !== 'login'" class="auth-page__tabs">
                <button :class="['auth-page__tab', { active: mode === 'partner' }]" @click="switchMode('partner')">
                  <span class="icon-user"></span> Herd Partner
                </button>
                <button :class="['auth-page__tab', { active: mode === 'vendor' }]" @click="switchMode('vendor')">
                  <span class="icon-trading"></span> Business Vendor
                </button>
                <button :class="['auth-page__tab', { active: mode === 'tourist' }]" @click="switchMode('tourist')">
                  🌍 Tourist
                </button>
              </div>

              <!-- ===== PARTNER REGISTER ===== -->
              <div v-show="mode === 'partner'" class="auth-page__box">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page5.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Partner Registration</h2>
                    <p>Become a Custherds Partner — Join now and start earning while sharing the best of Bali!</p>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <form @submit.prevent="handleSubmit('partner')">
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
                    <!-- TnC checkbox -->
                    <div class="auth-page__tnc-row">
                      <label class="auth-page__tnc-label">
                        <input type="checkbox" v-model="tncAccepted" disabled />
                        I have read and agree to the
                        <a href="#" @click.prevent="openTnc('partner')">Terms &amp; Conditions</a>
                        <span class="req">*</span>
                      </label>
                      <span v-if="!tncAccepted" class="auth-page__tnc-hint">Please read the T&amp;C fully to enable this checkbox</span>
                    </div>
                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn" :disabled="!tncAccepted">
                        Register as Partner <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>
                    <p class="auth-page__switch">Already have an account? <a href="#" @click.prevent="switchMode('login')">Login here</a></p>
                  </form>
                </div>
              </div>

              <!-- ===== VENDOR REGISTER ===== -->
              <div v-show="mode === 'vendor'" class="auth-page__box">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page4.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Business Vendor Registration</h2>
                    <p>Grow your business in Bali with zero upfront cost. We only earn when you earn.</p>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <form @submit.prevent="handleSubmit('vendor')">
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
                          <option value="12">Sidemen</option><option value="13">Tabanan</option>
                          <option value="11">Tegallalang</option><option value="10">Ubud</option>
                        </optgroup>
                        <optgroup label="East Bali">
                          <option value="17">Amed</option><option value="18">Candidasa</option>
                        </optgroup>
                        <optgroup label="Islands">
                          <option value="21">Nusa Ceningan</option><option value="20">Nusa Lembongan</option>
                          <option value="19">Nusa Penida</option>
                        </optgroup>
                        <optgroup label="North Bali">
                          <option value="14">Lovina</option><option value="15">Munduk</option>
                          <option value="16">Singaraja</option>
                        </optgroup>
                        <optgroup label="South Bali">
                          <option value="1">Canggu</option><option value="6">Jimbaran</option>
                          <option value="5">Kuta</option><option value="4">Legian</option>
                          <option value="8">Nusa Dua</option><option value="2">Pererenan</option>
                          <option value="3">Seminyak</option><option value="9">Tanah Lot</option>
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
                    <!-- TnC checkbox -->
                    <div class="auth-page__tnc-row">
                      <label class="auth-page__tnc-label">
                        <input type="checkbox" v-model="tncAccepted" disabled />
                        I have read and agree to the
                        <a href="#" @click.prevent="openTnc('vendor')">Terms &amp; Conditions</a>
                        <span class="req">*</span>
                      </label>
                      <span v-if="!tncAccepted" class="auth-page__tnc-hint">Please read the T&amp;C fully to enable this checkbox</span>
                    </div>
                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn" :disabled="!tncAccepted">
                        Register Business Vendor <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>
                    <p class="auth-page__switch">Already have an account? <a href="#" @click.prevent="switchMode('login')">Login here</a></p>
                  </form>
                </div>
              </div>

              <!-- ===== TOURIST REGISTER ===== -->
              <div v-show="mode === 'tourist'" class="auth-page__box">
                <div class="auth-page__hero" :style="{ backgroundImage: 'url(https://www.custherds.com/assets/images/slide/page3.webp)' }">
                  <div class="auth-page__hero-overlay"></div>
                  <div class="auth-page__hero-content">
                    <h2>Join as a Traveller</h2>
                    <p>Create a free account to connect directly with verified local guides across Bali.</p>
                    <div class="auth-page__hero-perks">
                      <span>✓ Free to join</span>
                      <span>✓ Chat guides via WhatsApp</span>
                      <span>✓ No booking fees</span>
                    </div>
                  </div>
                </div>
                <div class="auth-page__form-wrap">
                  <form @submit.prevent="handleSubmit('tourist')">
                    <h4 class="auth-page__section-title">Your Details</h4>
                    <hr />
                    <div class="auth-page__field">
                      <label>Full Name <span class="req">*</span></label>
                      <input type="text" v-model="tf.name" placeholder="e.g. John Smith" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" v-model="tf.email" placeholder="your@email.com" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Phone / WhatsApp</label>
                      <input type="tel" v-model="tf.phone" placeholder="e.g. +44 7911 123456" />
                    </div>
                    <div class="auth-page__field">
                      <label>Nationality <span class="req">*</span></label>
                      <input type="text" v-model="tf.nationality" placeholder="e.g. British" required />
                    </div>
                    <div class="auth-page__field">
                      <label>Planned Visit Date</label>
                      <input type="date" v-model="tf.visit_date" :min="today" />
                    </div>
                    <div class="auth-page__field">
                      <label>Area of Interest</label>
                      <select v-model="tf.area_interest">
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
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Password <span class="req">*</span></label>
                          <input type="password" v-model="tf.password" placeholder="Min. 8 characters" minlength="8" required />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="auth-page__field">
                          <label>Confirm Password <span class="req">*</span></label>
                          <input type="password" v-model="tf.password_confirm" placeholder="Repeat password" minlength="8" required />
                        </div>
                      </div>
                    </div>
                    <p class="auth-page__error" v-if="touristError">{{ touristError }}</p>
                    <p class="auth-page__success" v-if="touristSuccess">{{ touristSuccess }}</p>
                    <!-- TnC checkbox -->
                    <div class="auth-page__tnc-row">
                      <label class="auth-page__tnc-label">
                        <input type="checkbox" v-model="tncAccepted" disabled />
                        I have read and agree to the
                        <a href="#" @click.prevent="openTnc('tourist')">Terms &amp; Conditions</a>
                        <span class="req">*</span>
                      </label>
                      <span v-if="!tncAccepted" class="auth-page__tnc-hint">Please read the T&amp;C fully to enable this checkbox</span>
                    </div>
                    <div class="auth-page__actions">
                      <button type="submit" class="thm-btn" :disabled="touristLoading || !tncAccepted">
                        {{ touristLoading ? 'Creating account…' : 'Create Free Account' }}
                        <span class="icon-up-right-arrow"></span>
                      </button>
                    </div>
                    <p class="auth-page__switch">Already have an account? <router-link to="/tourist/login">Sign in here</router-link></p>
                  </form>
                </div>
              </div>

              <!-- ===== LOGIN ===== -->
              <div v-show="mode === 'login'" class="auth-page__box">
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
                    <p class="auth-page__switch">Don&rsquo;t have an account? <a href="#" @click.prevent="switchMode('partner')">Register here</a></p>
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

    <!-- ===== TnC MODAL ===== -->
    <Teleport to="body">
      <div v-if="tncModalOpen" class="tnc-modal__backdrop" @click.self="closeTnc">
        <div class="tnc-modal">
          <div class="tnc-modal__header">
            <h3>Custherds.com — Terms &amp; Conditions</h3>
            <button class="tnc-modal__close" @click="closeTnc" aria-label="Close">✕</button>
          </div>

          <!-- Scrollable body -->
          <div class="tnc-modal__body" ref="tncBody" @scroll="onTncScroll">
            <p><strong>Effective Date:</strong> 14 October 2025</p>
            <p>Welcome to Custherds.com ("we," "our," or "the Platform"). By accessing or using the Platform, you agree to the following Terms &amp; Conditions. Please read them carefully.</p>
            <hr />
            <p><strong>1. Business Overview</strong></p>
            <p>Custherds.com is an online platform that connects Bali-based businesses ("Vendors") with tourism affiliates or guides ("Affiliates"). Affiliates can earn commissions by referring customers to Vendors through the Platform.</p>
            <ul>
              <li>Commissions and referral rules may vary depending on deals with each Vendor.</li>
              <li>The Platform may include VIP-targeted offers, cashback systems, or special promotions as determined by Custherds.com.</li>
            </ul>
            <p><strong>2. Payment System</strong></p>
            <ul>
              <li>Currently, all payments and commissions are processed manually via bank transfer or QR payment.</li>
              <li>Automation of payment processes may be implemented in the future.</li>
              <li>Custherds.com will notify users in advance if any automated system changes are introduced.</li>
            </ul>
            <p><strong>3. Commission Rules</strong></p>
            <ul>
              <li>Commissions earned by Affiliates depend on agreements between Vendors and the Platform.</li>
              <li>Custherds.com does not guarantee a fixed percentage for every transaction; it is subject to each Vendor's deal.</li>
            </ul>
            <p><strong>4. Legal Base / Location</strong></p>
            <ul>
              <li>Custherds.com operates under the laws of Indonesia, specifically Bali.</li>
              <li>Any disputes will be resolved according to Indonesian law.</li>
            </ul>
            <p><strong>5. User Responsibilities</strong></p>
            <ul>
              <li>Users (Vendors and Affiliates) must provide accurate information when registering on the Platform.</li>
              <li>Users are responsible for their own transactions outside the agreed referral system, but must follow Section 6 regarding prohibited direct transactions.</li>
            </ul>
            <p><strong>6. Direct Transactions &amp; Anti-Cheating Policy</strong></p>
            <ul>
              <li>All payments for transactions referred via Custherds.com must be processed through the Platform, unless otherwise agreed in writing by Custherds.com.</li>
              <li>Vendors and Affiliates must not solicit or accept direct payments from each other outside the Platform in a way that bypasses commissions or agreed fees.</li>
              <li>Any Vendor or Affiliate found bypassing the Platform to avoid paying commissions or fees will face:
                <ul>
                  <li>Immediate suspension or termination of their account</li>
                  <li>Legal action to recover owed commissions</li>
                  <li>Loss of access to all future opportunities on Custherds.com</li>
                </ul>
              </li>
              <li>Custherds.com reserves the right to audit transactions and take measures to protect its platform, revenue, and users.</li>
            </ul>
            <p><strong>7. Disclaimers &amp; Liability</strong></p>
            <ul>
              <li>Custherds.com is a platform facilitator and is not responsible for direct transactions between users and Vendors outside the Platform's referral system.</li>
              <li>Custherds.com is not liable for any losses, damages, or disputes arising from transactions conducted outside the Platform.</li>
              <li>Custherds.com reserves the right to suspend or terminate accounts violating these Terms &amp; Conditions.</li>
            </ul>
            <p><strong>8. Intellectual Property</strong></p>
            <ul>
              <li>All content on Custherds.com, including logos, images, and text, is the property of Custherds.com unless otherwise stated.</li>
              <li>Users may not copy, reproduce, or distribute content without permission.</li>
            </ul>
            <p><strong>9. Privacy &amp; Data</strong></p>
            <ul>
              <li>Custherds.com collects and processes user data in accordance with applicable Indonesian privacy laws.</li>
              <li>Users consent to the use of their data for Platform operations and communication purposes.</li>
            </ul>
            <p><strong>10. Amendments</strong></p>
            <ul>
              <li>Custherds.com may update these Terms &amp; Conditions at any time.</li>
              <li>Users will be notified of major changes through the Platform or registered email addresses.</li>
            </ul>
            <p>By using Custherds.com, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions.</p>
          </div>

          <!-- Footer: progress indicator + checkbox + button -->
          <div class="tnc-modal__footer">
            <div class="tnc-modal__progress-wrap">
              <div class="tnc-modal__progress-bar" :style="{ width: tncScrollPct + '%' }"></div>
            </div>
            <p v-if="!tncScrolledToEnd" class="tnc-modal__scroll-hint">
              ↓ Scroll to the bottom to continue ({{ tncScrollPct }}%)
            </p>
            <label v-else class="tnc-modal__agree-label">
              <input type="checkbox" v-model="tncModalChecked" />
              I have read and agree to all Terms &amp; Conditions
            </label>
            <button
              class="thm-btn tnc-modal__confirm-btn"
              :disabled="!tncModalChecked"
              @click="confirmTnc"
            >
              Confirm &amp; Continue <span class="icon-up-right-arrow"></span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
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
const mode = ref(route.path.startsWith('/tourist') ? 'tourist' : 'partner');
const loginType = ref('partner');

function switchMode(m) {
  mode.value = m;
  tncAccepted.value = false;
}

const pageTitle = computed(() => {
  if (mode.value === 'login')   return 'Welcome Back';
  if (mode.value === 'vendor')  return 'Business Vendor Registration';
  if (mode.value === 'tourist') return 'Join as a Traveller';
  return 'Partner Registration';
});

const today = computed(() => new Date().toISOString().split('T')[0]);

// ─────────────────────────────────────────────
// TnC Modal state
// ─────────────────────────────────────────────
const tncModalOpen      = ref(false);
const tncScrolledToEnd  = ref(false);
const tncScrollPct      = ref(0);
const tncModalChecked   = ref(false);
const tncAccepted       = ref(false);   // controls checkbox + submit button in form
const tncBody           = ref(null);

function openTnc() {
  tncModalOpen.value     = true;
  tncScrolledToEnd.value = false;
  tncScrollPct.value     = 0;
  tncModalChecked.value  = false;
  document.body.style.overflow = 'hidden';
  nextTick(() => {
    if (tncBody.value) tncBody.value.scrollTop = 0;
  });
}

function closeTnc() {
  tncModalOpen.value = false;
  document.body.style.overflow = '';
}

function onTncScroll() {
  const el = tncBody.value;
  if (!el) return;
  const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
  tncScrollPct.value = Math.min(pct, 100);
  if (tncScrollPct.value >= 95) tncScrolledToEnd.value = true;
}

function confirmTnc() {
  if (!tncModalChecked.value) return;
  tncAccepted.value = true;
  closeTnc();
}

// ─────────────────────────────────────────────
// Form gate — intercept submit if TnC not accepted
// ─────────────────────────────────────────────
function handleSubmit(type) {
  if (!tncAccepted.value) { openTnc(); return; }
  if (type === 'partner') submitPartner();
  else if (type === 'vendor') submitVendor();
  else submitTourist();
}

// ─ Partner form
const partnerError = ref('');
const pf = ref({
  user_name: '', user_email: '', user_phone: '',
  user_password: '', pass_confirm: '',
  ig_link: '', fb_link: '', yt_link: '', tiktok_link: '',
  guide_nationality: '', guide_certificate: null
});
function submitPartner() {
  if (pf.value.user_password !== pf.value.pass_confirm) { partnerError.value = 'Passwords do not match.'; return; }
  partnerError.value = '';
  const fd = new FormData();
  Object.entries(pf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
  fd.append('user_type', '1');
  fetch('https://www.custherds.com/register/saveRegistration', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Registration submitted!') : alert('Something went wrong.'))
    .catch(() => alert('Network error. Please try again.'));
}

// ─ Vendor form
const vendorError = ref('');
const vf = ref({
  user_name: '', user_email: '', user_phone: '',
  user_password: '', pass_confirm: '',
  ig_link: '', fb_link: '', yt_link: '', tiktok_link: '',
  vendor_business_name: '', vendor_category: '', vendor_area: '',
  vendor_location: '', vendor_contact_person: '', vendor_website: '',
  vendor_short_description: '', vendor_opening_hours: '',
  vendor_min_spend: '', vendor_cashback_percent: '', vendor_know_from: ''
});
function submitVendor() {
  if (vf.value.user_password !== vf.value.pass_confirm) { vendorError.value = 'Passwords do not match.'; return; }
  vendorError.value = '';
  const fd = new FormData();
  Object.entries(vf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
  fd.append('user_type', '2');
  fetch('https://www.custherds.com/register/saveRegistration', { method: 'POST', body: fd })
    .then(r => r.ok ? alert('Registration submitted!') : alert('Something went wrong.'))
    .catch(() => alert('Network error. Please try again.'));
}

// ─ Tourist form
const touristError   = ref('');
const touristSuccess = ref('');
const touristLoading = ref(false);
const tf = ref({
  name: '', email: '', phone: '', nationality: '',
  visit_date: '', area_interest: '', password: '', password_confirm: ''
});
async function submitTourist() {
  touristError.value   = '';
  touristSuccess.value = '';
  if (tf.value.password !== tf.value.password_confirm) {
    touristError.value = 'Passwords do not match.'; return;
  }
  touristLoading.value = true;
  try {
    const fd = new FormData();
    Object.entries(tf.value).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fd.append('user_type', '3');
    const res = await fetch('https://www.custherds.com/register/saveTourist', { method: 'POST', body: fd });
    if (res.ok) {
      touristSuccess.value = '🎉 Account created! Tourist login will be available soon.';
      tf.value = { name: '', email: '', phone: '', nationality: '', visit_date: '', area_interest: '', password: '', password_confirm: '' };
      tncAccepted.value = false;
    } else {
      touristError.value = 'Registration failed. This email may already be in use.';
    }
  } catch {
    touristError.value = 'Network error. Please try again.';
  } finally {
    touristLoading.value = false;
  }
}

// ─ Login
const lf = ref({ email: '', password: '' });
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
/* ─── Tabs ─── */
.auth-page__tabs { display: flex; gap: 12px; margin-bottom: 24px; }
.auth-page__tab {
  flex: 1; padding: 14px 20px; border: 2px solid #ddd; border-radius: 10px;
  background: #fff; font-size: 15px; font-weight: 600; color: #555;
  cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.auth-page__tab.active, .auth-page__tab:hover {
  border-color: var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c); background: #fffaf0;
}
.auth-page__login-type { display: flex; gap: 10px; margin-bottom: 28px; }
.auth-page__type-btn {
  flex: 1; padding: 10px; border: 2px solid #ddd; border-radius: 8px;
  background: #fff; font-size: 14px; font-weight: 600; color: #777;
  cursor: pointer; transition: all 0.2s;
}
.auth-page__type-btn.active, .auth-page__type-btn:hover {
  border-color: var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c); background: #fffaf0;
}
/* ─── Box ─── */
.auth-page__box { border-radius: 16px; overflow: hidden; box-shadow: 0 12px 48px rgba(0,0,0,0.10); }
.auth-page__hero { position: relative; background-size: cover; background-position: center; padding: 60px 40px; }
.auth-page__hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
.auth-page__hero-content { position: relative; z-index: 2; text-align: center; color: #fff; }
.auth-page__hero-content h2 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
.auth-page__hero-content p { font-size: 16px; opacity: 0.85; margin-bottom: 16px; }
.auth-page__hero-perks { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.auth-page__hero-perks span {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px);
}
/* ─── Form ─── */
.auth-page__form-wrap { background: #fff; padding: 40px; }
.auth-page__section-title { font-size: 22px; font-weight: 700; color: var(--thm-black, #1a1a1a); margin-bottom: 12px; }
.auth-page__field { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
.auth-page__field label { font-size: 14px; font-weight: 600; color: #555; }
.auth-page__field input,
.auth-page__field select,
.auth-page__field textarea {
  border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px;
  font-size: 15px; transition: border 0.2s; outline: none; width: 100%; background: #fff;
}
.auth-page__field input:focus,
.auth-page__field select:focus,
.auth-page__field textarea:focus { border-color: var(--thm-primary, #c9a84c); }
.auth-page__hint { font-size: 12px; color: #999; }
.req { color: #e53e3e; }
.auth-page__actions { margin-top: 24px; margin-bottom: 20px; }
.auth-page__actions .thm-btn { width: 100%; text-align: center; display: block; padding: 14px; }
.auth-page__actions .thm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.auth-page__forgot { text-align: right; margin-bottom: 8px; }
.auth-page__forgot a { font-size: 13px; color: var(--thm-primary, #c9a84c); text-decoration: none; }
.auth-page__switch { font-size: 14px; color: #666; text-align: center; margin-top: 8px; }
.auth-page__switch a { color: var(--thm-primary, #c9a84c); font-weight: 600; text-decoration: none; }
.auth-page__switch a:hover { text-decoration: underline; }
.auth-page__error {
  color: #e53e3e; font-size: 13px; background: #fff5f5;
  border: 1px solid #fed7d7; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;
}
.auth-page__success {
  color: #276749; font-size: 13px; background: #f0fff4;
  border: 1px solid #9ae6b4; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;
}
/* ─── TnC Row in form ─── */
.auth-page__tnc-row { margin-bottom: 8px; }
.auth-page__tnc-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: #444; cursor: default;
}
.auth-page__tnc-label input[type="checkbox"] { width: 16px; height: 16px; cursor: default; }
.auth-page__tnc-label a { color: var(--thm-primary, #c9a84c); text-decoration: underline; cursor: pointer; }
.auth-page__tnc-hint { display: block; font-size: 11px; color: #999; margin-top: 4px; margin-left: 24px; }

/* ─── TnC MODAL ─── */
.tnc-modal__backdrop {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.tnc-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 680px;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  overflow: hidden;
}
.tnc-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid #eee;
  background: var(--thm-primary, #c9a84c);
}
.tnc-modal__header h3 { font-size: 17px; font-weight: 700; color: #fff; margin: 0; }
.tnc-modal__close {
  background: rgba(255,255,255,0.25); border: none; color: #fff;
  width: 32px; height: 32px; border-radius: 50%;
  font-size: 14px; cursor: pointer; transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.tnc-modal__close:hover { background: rgba(255,255,255,0.45); }
.tnc-modal__body {
  flex: 1; overflow-y: auto; padding: 28px;
  font-size: 14px; line-height: 1.75; color: #333;
  scroll-behavior: smooth;
}
.tnc-modal__body p { margin-bottom: 12px; }
.tnc-modal__body ul { padding-left: 20px; margin-bottom: 12px; }
.tnc-modal__body ul li { margin-bottom: 6px; }
.tnc-modal__body hr { margin: 16px 0; border-color: #eee; }
.tnc-modal__footer {
  padding: 16px 28px 20px;
  border-top: 2px solid #eee;
  background: #fafafa;
}
.tnc-modal__progress-wrap {
  height: 6px; background: #e2e2e2; border-radius: 3px;
  margin-bottom: 12px; overflow: hidden;
}
.tnc-modal__progress-bar {
  height: 100%; background: var(--thm-primary, #c9a84c);
  border-radius: 3px; transition: width 0.2s;
}
.tnc-modal__scroll-hint {
  font-size: 13px; color: #888; text-align: center; margin-bottom: 12px;
}
.tnc-modal__agree-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600; color: #333;
  cursor: pointer; margin-bottom: 14px;
}
.tnc-modal__agree-label input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--thm-primary, #c9a84c); }
.tnc-modal__confirm-btn {
  width: 100%; padding: 13px; text-align: center;
  display: block; border-radius: 30px;
}
.tnc-modal__confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 768px) {
  .auth-page__form-wrap { padding: 24px 16px; }
  .auth-page__hero { padding: 40px 20px; }
  .auth-page__tabs { flex-direction: column; }
  .tnc-modal__body { padding: 20px 16px; }
  .tnc-modal__footer { padding: 14px 16px 16px; }
}
</style>
