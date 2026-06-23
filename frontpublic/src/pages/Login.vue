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

      <section class="login-page">
        <div class="container">

          <!-- ── Redirect cards ── -->
          <div class="row justify-content-center" style="row-gap: 24px;">

            <div class="col-12 col-sm-6 col-lg-4">
              <div class="lp-card">
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
              <div class="lp-card">
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
          <!-- end redirect cards -->

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
import Preloader    from '@/components/common/Preloader.vue';
import ChatPopup    from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav    from '@/components/common/MobileNav.vue';
import SearchPopup  from '@/components/common/SearchPopup.vue';
import ScrollToTop  from '@/components/common/ScrollToTop.vue';
import HeaderTwo    from '@/components/layout/header/HeaderTwo.vue';
import PageHeader   from '@/components/common/PageHeader.vue';
import Footer1      from '@/components/layout/footer/Footer1.vue';
</script>

<style scoped>
/* ─── Section ─── */
.login-page {
  background-color: #0a0a0a;
  padding: 60px 0 80px;
  overflow: visible;
}

/* ─── Card ─── */
.lp-card {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: border-color 0.25s, box-shadow 0.25s;
  margin-bottom: 0;
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
.lp-card__icon-wrap span { font-size: 26px; color: #fff; }

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
.lp-card__btn {
  width: 100%;
  text-align: center;
}
</style>
