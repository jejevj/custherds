<template>
  <div>
    <Preloader />
    <ChatPopup />
    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>
    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />

      <PageHeader title="Terms & Conditions" subtitle="Please read these terms carefully before using Custherds." />

      <section class="terms-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-9">

              <div class="terms-block">
                <p class="terms-updated">Last updated: June 2025</p>

                <div v-for="(section, i) in sections" :key="i" class="terms-section">
                  <h2 class="terms-section__title">{{ section.title }}</h2>
                  <p v-for="(para, pi) in section.body" :key="pi" class="terms-section__body">{{ para }}</p>
                </div>

                <div class="terms-cta">
                  <p>Have questions about our Terms?</p>
                  <router-link to="/contact" class="thm-btn">
                    Contact Us <span class="icon-up-right-arrow"></span>
                  </router-link>
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
import Preloader    from '@/components/common/Preloader.vue';
import ChatPopup   from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav   from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo   from '@/components/layout/header/HeaderTwo.vue';
import PageHeader  from '@/components/common/PageHeader.vue';
import Footer1     from '@/components/layout/footer/Footer1.vue';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using Custherds.com (\"the Platform\"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform.',
      'We reserve the right to update or modify these Terms at any time. Continued use of the Platform after changes constitutes your acceptance of the revised Terms.',
    ]
  },
  {
    title: '2. Description of Service',
    body: [
      'Custherds.com is an affiliate-based platform that connects Herd Partners (affiliates/tour guides) with Business Vendors (merchants). Partners refer customers to vendors, and upon successful transactions, Partners earn a cashback commission.',
      'The Platform provides tools for tracking referrals, managing transactions, and facilitating payouts between parties.',
    ]
  },
  {
    title: '3. Eligibility',
    body: [
      'You must be at least 18 years of age to register and use the Platform.',
      'By registering, you represent that all information you provide is accurate, current, and complete.',
    ]
  },
  {
    title: '4. Account Registration',
    body: [
      'Users must register for an account to access Platform features. You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree to notify Custherds.com immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.',
    ]
  },
  {
    title: '5. Partner (Affiliate) Obligations',
    body: [
      'Herd Partners agree to promote Business Vendors honestly and in good faith. Partners must not use deceptive, misleading, or unlawful marketing practices.',
      'Partners are responsible for ensuring that referred customers genuinely intend to complete transactions. Fraudulent referrals will result in account suspension and forfeiture of earned commissions.',
    ]
  },
  {
    title: '6. Vendor Obligations',
    body: [
      'Business Vendors agree to honor all transactions referred through the Platform and to provide accurate product or service information on their listings.',
      'Vendors are responsible for fulfilling orders and resolving customer disputes related to their products or services.',
    ]
  },
  {
    title: '7. Commission & Payouts',
    body: [
      'Commission rates are determined by individual vendor agreements and are displayed within the Platform dashboard.',
      'Payouts are processed after a transaction is confirmed as completed. Custherds.com earns a service fee from each successful transaction. Payout schedules and minimum thresholds are outlined in the Platform dashboard.',
    ]
  },
  {
    title: '8. Prohibited Activities',
    body: [
      'Users must not: engage in fraudulent activity; attempt to manipulate referral or transaction data; use the Platform to distribute spam or malware; violate any applicable local, national, or international laws.',
      'Violations may result in immediate account termination and legal action where applicable.',
    ]
  },
  {
    title: '9. Intellectual Property',
    body: [
      'All content on the Platform, including logos, text, graphics, and software, is the property of Custherds.com and is protected by applicable intellectual property laws.',
      'Users may not reproduce, distribute, or create derivative works from Platform content without explicit written permission.',
    ]
  },
  {
    title: '10. Limitation of Liability',
    body: [
      'Custherds.com is not liable for any indirect, incidental, or consequential damages arising from the use of the Platform, including loss of revenue or data.',
      'The Platform is provided on an \"as-is\" basis. We do not warrant that the Platform will be error-free or uninterrupted.',
    ]
  },
  {
    title: '11. Privacy',
    body: [
      'Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
      'We collect and process personal data in accordance with applicable data protection regulations.',
    ]
  },
  {
    title: '12. Termination',
    body: [
      'Custherds.com reserves the right to suspend or terminate any account at its discretion, with or without notice, for violations of these Terms or for any other reason.',
      'Upon termination, your right to use the Platform ceases immediately. Pending commissions may be forfeited if termination is due to a policy violation.',
    ]
  },
  {
    title: '13. Governing Law',
    body: [
      'These Terms are governed by and construed in accordance with the laws of the Republic of Indonesia.',
      'Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Bali, Indonesia.',
    ]
  },
  {
    title: '14. Contact',
    body: [
      'If you have any questions about these Terms, please contact us at team@custherds.com or via WhatsApp at +62877 6108 1555.',
    ]
  },
];
</script>

<style scoped>
.terms-page {
  background-color: #0a0a0a;
  min-height: 60vh;
}

.terms-block {
  color: #cccccc;
}

.terms-updated {
  font-size: 13px;
  color: #666;
  margin-bottom: 36px;
  font-style: italic;
}

.terms-section {
  margin-bottom: 36px;
  padding-bottom: 36px;
  border-bottom: 1px solid #1e1e1e;
}
.terms-section:last-of-type {
  border-bottom: none;
}

.terms-section__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--thm-primary, #c9a84c);
  margin-bottom: 12px;
}

.terms-section__body {
  font-size: 15px;
  line-height: 1.8;
  color: #cccccc;
  margin-bottom: 10px;
}
.terms-section__body:last-child { margin-bottom: 0; }

.terms-cta {
  margin-top: 48px;
  text-align: center;
}
.terms-cta p {
  color: #aaa;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
