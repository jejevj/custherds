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
          <div class="row justify-content-center">
            <div class="col-12 text-center mb-5 wow fadeInDown" data-wow-delay="100ms">
              <div class="section-title sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">Login as</h2>
                <p class="login-page__subtitle">Choose your account type to continue</p>
              </div>
            </div>

            <!-- Herd Partners Login -->
            <div class="col-md-5 wow fadeInLeft" data-wow-delay="200ms">
              <div class="login-page__card">
                <div class="login-page__card-icon">
                  <span class="icon-user"></span>
                </div>
                <h3 class="login-page__card-title">Herd Partners</h3>
                <p class="login-page__card-text">Access your partner dashboard, track referrals, and monitor your earnings.</p>
                <a href="https://www.custherds.com/login" target="_blank" class="thm-btn login-page__btn">
                  Login as Herd Partner <span class="icon-up-right-arrow"></span>
                </a>
              </div>
            </div>

            <!-- Divider -->
            <div class="col-md-1 d-flex align-items-center justify-content-center wow fadeIn" data-wow-delay="300ms">
              <div class="login-page__divider">or</div>
            </div>

            <!-- Business Vendor Login -->
            <div class="col-md-5 wow fadeInRight" data-wow-delay="200ms">
              <div class="login-page__card">
                <div class="login-page__card-icon">
                  <span class="icon-trading"></span>
                </div>
                <h3 class="login-page__card-title">Business Vendor</h3>
                <p class="login-page__card-text">Manage your listings, track bookings, and monitor your affiliate network performance.</p>
                <a href="https://www.custherds.com/login" target="_blank" class="thm-btn login-page__btn">
                  Login as Business Vendor <span class="icon-up-right-arrow"></span>
                </a>
              </div>
            </div>

            <!-- No account yet -->
            <div class="col-12 text-center mt-5 wow fadeInUp" data-wow-delay="400ms">
              <p class="login-page__register-text">
                Don&rsquo;t have an account yet?
                <router-link to="/register" class="login-page__register-link">Register here</router-link>
              </p>
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
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';
</script>

<style scoped>
.login-page__subtitle {
    font-size: 16px;
    color: #666;
    margin-top: 8px;
}

.login-page__card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    height: 100%;
    transition: box-shadow 0.3s, transform 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-page__card:hover {
    box-shadow: 0 16px 48px rgba(0,0,0,0.10);
    transform: translateY(-4px);
}

.login-page__card-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--thm-primary, #c9a84c);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.login-page__card-icon span {
    font-size: 28px;
    color: #fff;
}

.login-page__card-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--thm-black, #1a1a1a);
}

.login-page__card-text {
    font-size: 15px;
    color: #666;
    line-height: 1.8;
    margin-bottom: 32px;
    flex: 1;
}

.login-page__btn {
    margin-top: auto;
    width: 100%;
    text-align: center;
}

.login-page__divider {
    font-size: 18px;
    font-weight: 700;
    color: #aaa;
    padding: 16px 0;
}

.login-page__register-text {
    font-size: 15px;
    color: #666;
}

.login-page__register-link {
    color: var(--thm-primary, #c9a84c);
    font-weight: 600;
    text-decoration: none;
}

.login-page__register-link:hover {
    text-decoration: underline;
}
</style>
