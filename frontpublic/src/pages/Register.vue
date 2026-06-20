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
        title="Create an Account"
        subtitle="Join the Herd. Grow. Earn. Together."
      />

      <section class="register-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 text-center mb-5 wow fadeInDown" data-wow-delay="100ms">
              <div class="section-title sec-title-animation animation-style2">
                <h2 class="section-title__title title-animation">Register as</h2>
                <p class="register-page__subtitle">Choose how you want to join Custherds</p>
              </div>
            </div>

            <!-- Herd Partners Card -->
            <div class="col-md-5 wow fadeInLeft" data-wow-delay="200ms">
              <div class="register-page__card">
                <div class="register-page__card-icon">
                  <span class="icon-user"></span>
                </div>
                <h3 class="register-page__card-title">Herd Partners</h3>
                <p class="register-page__card-text">Earn commission by referring customers to trusted business vendors. Turn your network into net worth.</p>
                <ul class="register-page__card-list list-unstyled">
                  <li><i class="fa fa-check"></i> No upfront cost</li>
                  <li><i class="fa fa-check"></i> Earn per completed service</li>
                  <li><i class="fa fa-check"></i> Track earnings in real-time</li>
                </ul>
                <a href="https://www.custherds.com/register/partners?reg=true" target="_blank" class="thm-btn register-page__btn">
                  Register as Herd Partner <span class="icon-up-right-arrow"></span>
                </a>
              </div>
            </div>

            <!-- Divider -->
            <div class="col-md-1 d-flex align-items-center justify-content-center wow fadeIn" data-wow-delay="300ms">
              <div class="register-page__divider">or</div>
            </div>

            <!-- Business Vendor Card -->
            <div class="col-md-5 wow fadeInRight" data-wow-delay="200ms">
              <div class="register-page__card">
                <div class="register-page__card-icon">
                  <span class="icon-trading"></span>
                </div>
                <h3 class="register-page__card-title">Business Vendor</h3>
                <p class="register-page__card-text">List your business and gain real exposure. Only pay commission after a service is successfully completed.</p>
                <ul class="register-page__card-list list-unstyled">
                  <li><i class="fa fa-check"></i> Performance-based commission</li>
                  <li><i class="fa fa-check"></i> Unlimited affiliate partners</li>
                  <li><i class="fa fa-check"></i> Booking management dashboard</li>
                </ul>
                <a href="https://www.custherds.com/register/vendors?reg=true" target="_blank" class="thm-btn register-page__btn">
                  Register as Business Vendor <span class="icon-up-right-arrow"></span>
                </a>
              </div>
            </div>

            <!-- Already have account -->
            <div class="col-12 text-center mt-5 wow fadeInUp" data-wow-delay="400ms">
              <p class="register-page__login-text">
                Already have an account?
                <router-link to="/login" class="register-page__login-link">Login here</router-link>
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
.register-page__subtitle {
    font-size: 16px;
    color: #666;
    margin-top: 8px;
}

.register-page__card {
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

.register-page__card:hover {
    box-shadow: 0 16px 48px rgba(0,0,0,0.10);
    transform: translateY(-4px);
}

.register-page__card-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--thm-primary, #c9a84c);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.register-page__card-icon span {
    font-size: 28px;
    color: #fff;
}

.register-page__card-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--thm-black, #1a1a1a);
}

.register-page__card-text {
    font-size: 15px;
    color: #666;
    line-height: 1.8;
    margin-bottom: 24px;
}

.register-page__card-list {
    text-align: left;
    margin-bottom: 32px;
    width: 100%;
}

.register-page__card-list li {
    font-size: 14px;
    color: #444;
    padding: 6px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.register-page__card-list li i {
    color: var(--thm-primary, #c9a84c);
    font-size: 13px;
}

.register-page__btn {
    margin-top: auto;
    width: 100%;
    text-align: center;
}

.register-page__divider {
    font-size: 18px;
    font-weight: 700;
    color: #aaa;
    padding: 16px 0;
}

.register-page__login-text {
    font-size: 15px;
    color: #666;
}

.register-page__login-link {
    color: var(--thm-primary, #c9a84c);
    font-weight: 600;
    text-decoration: none;
}

.register-page__login-link:hover {
    text-decoration: underline;
}
</style>
