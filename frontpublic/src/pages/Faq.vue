<template>
  <div>
    <Preloader />
    <ChatPopup />
    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>
    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />

      <PageHeader title="FAQ" subtitle="Frequently Asked Questions" />

      <section class="faq-page py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-8">

              <div
                v-for="(item, i) in faqs"
                :key="i"
                class="faq-item"
                :class="{ open: openIndex === i }"
              >
                <button class="faq-item__question" @click="toggle(i)">
                  <span>{{ item.q }}</span>
                  <span class="faq-item__icon">{{ openIndex === i ? '−' : '+' }}</span>
                </button>
                <transition name="faq-slide">
                  <div v-if="openIndex === i" class="faq-item__answer">
                    <p v-for="(line, li) in item.a" :key="li">{{ line }}</p>
                  </div>
                </transition>
              </div>

              <div class="faq-cta">
                <p>Still have questions?</p>
                <router-link to="/contact" class="thm-btn">
                  Contact Us <span class="icon-up-right-arrow"></span>
                </router-link>
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

const openIndex = ref(null);
function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i;
}

const faqs = [
  {
    q: '1. What is Custherds.com?',
    a: [
      'Custherds.com is a platform that connects local and international tour guides with businesses. Guides help bring customers to your business, and in return, earn cashback from transactions made.'
    ]
  },
  {
    q: '2. How does Custherds.com work?',
    a: [
      'Businesses register on Custherds.com.',
      'Guides join the platform and promote your business to tourists.',
      'When a customer completes a transaction, the guide earns cashback, and you get more visibility and customers.'
    ]
  },
  {
    q: '3. Who can join Custherds.com?',
    a: [
      'Local and international tour guides.',
      'Businesses that want to attract more customers.',
      'Anyone interested in earning through referrals.'
    ]
  },
  {
    q: '4. Is there a fee to join?',
    a: [
      'Signing up as a guide or business is free.',
      'Custherds.com earns a small commission from successful transactions.'
    ]
  },
  {
    q: '5. How do guides earn cashback?',
    a: [
      'Guides receive a percentage of the transaction amount as cashback after the customer completes the payment.'
    ]
  },
  {
    q: '6. How do I track my earnings?',
    a: [
      'Custherds.com provides a dashboard where guides can track all completed transactions and cashback earned in real-time.'
    ]
  },
  {
    q: '7. How do customers pay?',
    a: [
      'Customers can pay via secure online payment options provided through Custherds.com.'
    ]
  },
  {
    q: "8. Can I join if I don't have a business or many followers?",
    a: [
      'Yes! Custherds.com works for anyone. Guides and businesses of any size can join, and all earnings are tracked automatically.'
    ]
  },
  {
    q: '9. Is Custherds.com safe and reliable?',
    a: [
      'Yes, all transactions are secure, and the platform ensures that both guides and businesses are verified.'
    ]
  },
  {
    q: '10. How do I get started?',
    a: [
      'Visit custherds.com and sign up as a guide or business. Follow the simple registration steps, and you\'re ready to start earning!'
    ]
  }
];
</script>

<style scoped>
.faq-page {
  background-color: #0a0a0a;
  min-height: 60vh;
}

/* Accordion item */
.faq-item {
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: border-color 0.25s;
}
.faq-item.open {
  border-color: var(--thm-primary, #c9a84c);
}

.faq-item__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #161616;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 16px;
  transition: background 0.2s, color 0.2s;
}
.faq-item.open .faq-item__question {
  background: #1e1a0e;
  color: var(--thm-primary, #c9a84c);
}
.faq-item__question:hover {
  background: #1e1a0e;
  color: var(--thm-primary, #c9a84c);
}

.faq-item__icon {
  font-size: 22px;
  font-weight: 300;
  flex-shrink: 0;
  line-height: 1;
  color: var(--thm-primary, #c9a84c);
}

.faq-item__answer {
  padding: 16px 24px 20px;
  background: #111;
}
.faq-item__answer p {
  color: #cccccc;
  font-size: 15px;
  line-height: 1.75;
  margin-bottom: 8px;
}
.faq-item__answer p:last-child { margin-bottom: 0; }

/* Slide transition */
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  max-height: 400px;
}
.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* CTA block */
.faq-cta {
  margin-top: 48px;
  text-align: center;
}
.faq-cta p {
  color: #aaa;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
