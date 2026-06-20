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
        title="Find Your Bali Guide"
        subtitle="Browse verified local guides — filter by area, specialty, and rating."
      />

      <section class="guides-page section-padding">
        <div class="container">

          <!-- ── FILTER BAR ─────────────────────────────── -->
          <div class="guides-page__filters wow animate__animated animate__fadeInDown" data-wow-delay="100ms">
            <!-- Search -->
            <div class="guides-page__search">
              <span class="icon-search"></span>
              <input
                v-model="search"
                type="text"
                placeholder="Search by name, area or specialty…"
              />
              <button v-if="search" class="guides-page__clear" @click="search = ''">&times;</button>
            </div>

            <!-- Region -->
            <select v-model="selectedRegion" class="guides-page__select">
              <option v-for="r in REGIONS" :key="r" :value="r">{{ r }}</option>
            </select>

            <!-- Specialty -->
            <select v-model="selectedSpecialty" class="guides-page__select">
              <option v-for="s in SPECIALTIES" :key="s" :value="s">{{ s }}</option>
            </select>

            <!-- Sort -->
            <select v-model="sortBy" class="guides-page__select">
              <option value="rating">Sort: Highest Rated</option>
              <option value="reviews">Sort: Most Reviewed</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="name">Sort: Name A–Z</option>
            </select>
          </div>

          <!-- ── RESULT COUNT ───────────────────────────── -->
          <p class="guides-page__count">
            Showing <strong>{{ filtered.length }}</strong> guide{{ filtered.length !== 1 ? 's' : '' }}
            <span v-if="search || selectedRegion !== 'All Regions' || selectedSpecialty !== 'All Specialties'"> for current filters</span>
          </p>

          <!-- ── GUIDE CARDS ────────────────────────────── -->
          <div v-if="filtered.length" class="guides-page__grid">
            <div
              v-for="(guide, i) in filtered"
              :key="guide.id"
              class="guide-card wow animate__animated animate__fadeInUp"
              :data-wow-delay="`${(i % 3) * 80}ms`"
            >
              <!-- Badge -->
              <span v-if="guide.verified" class="guide-card__verified">✓ Verified</span>

              <!-- Photo -->
              <div class="guide-card__photo-wrap">
                <img :src="guide.photo" :alt="guide.name" class="guide-card__photo" loading="lazy" />
              </div>

              <!-- Body -->
              <div class="guide-card__body">
                <h3 class="guide-card__name">{{ guide.name }}</h3>
                <p class="guide-card__tagline">{{ guide.tagline }}</p>

                <!-- Meta -->
                <div class="guide-card__meta">
                  <span class="guide-card__meta-item">
                    <span class="icon-location"></span> {{ guide.area }}
                  </span>
                  <span class="guide-card__meta-item">
                    <span class="icon-clock"></span> {{ guide.experience }} yrs exp
                  </span>
                </div>

                <!-- Specialties -->
                <div class="guide-card__tags">
                  <span
                    v-for="sp in guide.specialties.slice(0, 3)"
                    :key="sp"
                    class="guide-card__tag"
                  >{{ sp }}</span>
                </div>

                <!-- Languages -->
                <div class="guide-card__langs">
                  <span class="guide-card__langs-label">Speaks:</span>
                  {{ guide.languages.join(', ') }}
                </div>

                <!-- Rating -->
                <div class="guide-card__rating">
                  <span class="guide-card__stars">
                    <span
                      v-for="n in 5"
                      :key="n"
                      :class="['guide-card__star', n <= Math.round(guide.rating) ? 'filled' : '']">
                      ★
                    </span>
                  </span>
                  <span class="guide-card__rating-num">{{ guide.rating.toFixed(1) }}</span>
                  <span class="guide-card__review-count">({{ guide.reviewCount }} reviews)</span>
                </div>
              </div>

              <!-- Footer CTA -->
              <div class="guide-card__footer">
                <template v-if="isLoggedIn">
                  <a
                    :href="`https://wa.me/${guide.whatsapp}?text=${encodeURIComponent('Hi ' + guide.name + ', I found you on Custherds and would love to book a tour with you!')}`"
                    target="_blank"
                    rel="noopener"
                    class="guide-card__wa-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat on WhatsApp
                  </a>
                </template>
                <template v-else>
                  <router-link to="/register" class="guide-card__login-cta">
                    Login to contact guide
                  </router-link>
                </template>
              </div>
            </div>
          </div>

          <!-- ── EMPTY STATE ─────────────────────────────── -->
          <div v-else class="guides-page__empty">
            <span class="guides-page__empty-icon">🔍</span>
            <h3>No guides found</h3>
            <p>Try adjusting your search or filters.</p>
            <button class="thm-btn" @click="resetFilters">Clear Filters</button>
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
import { GUIDES, REGIONS, SPECIALTIES } from '@/data/guides.js';

// ── Auth state (replace with real store later) ──────────────
// Reads from localStorage — set by login flow
const isLoggedIn = computed(() => !!localStorage.getItem('tourist_token'));

// ── Filter state ────────────────────────────────────────────
const search = ref('');
const selectedRegion = ref('All Regions');
const selectedSpecialty = ref('All Specialties');
const sortBy = ref('rating');

function resetFilters() {
  search.value = '';
  selectedRegion.value = 'All Regions';
  selectedSpecialty.value = 'All Specialties';
  sortBy.value = 'rating';
}

// ── Filtered + sorted list ───────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();

  let list = GUIDES.filter(g => {
    const matchSearch = !q ||
      g.name.toLowerCase().includes(q) ||
      g.area.toLowerCase().includes(q) ||
      g.region.toLowerCase().includes(q) ||
      g.specialties.some(s => s.toLowerCase().includes(q)) ||
      g.languages.some(l => l.toLowerCase().includes(q)) ||
      g.tagline.toLowerCase().includes(q);

    const matchRegion = selectedRegion.value === 'All Regions' || g.region === selectedRegion.value;
    const matchSpecialty = selectedSpecialty.value === 'All Specialties' || g.specialties.includes(selectedSpecialty.value);

    return matchSearch && matchRegion && matchSpecialty;
  });

  list = [...list].sort((a, b) => {
    if (sortBy.value === 'rating') return b.rating - a.rating;
    if (sortBy.value === 'reviews') return b.reviewCount - a.reviewCount;
    if (sortBy.value === 'experience') return b.experience - a.experience;
    if (sortBy.value === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return list;
});
</script>

<style scoped>
.section-padding { padding: 60px 0 80px; }

/* ── Filter Bar ─────────────────────────── */
.guides-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
}
.guides-page__search {
  flex: 1 1 280px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fafafa;
  transition: border 0.2s;
}
.guides-page__search:focus-within {
  border-color: var(--thm-primary, #c9a84c);
  background: #fff;
}
.guides-page__search input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  width: 100%;
}
.guides-page__clear {
  background: none;
  border: none;
  font-size: 18px;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.guides-page__clear:hover { color: #333; }
.guides-page__select {
  flex: 1 1 160px;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  background: #fafafa;
  outline: none;
  cursor: pointer;
  transition: border 0.2s;
}
.guides-page__select:focus {
  border-color: var(--thm-primary, #c9a84c);
  background: #fff;
}

/* ── Count ───────────────────────────────── */
.guides-page__count {
  font-size: 14px;
  color: #888;
  margin-bottom: 28px;
}
.guides-page__count strong { color: #333; }

/* ── Grid ────────────────────────────────── */
.guides-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
@media (max-width: 1024px) { .guides-page__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .guides-page__grid { grid-template-columns: 1fr; } }

/* ── Guide Card ──────────────────────────── */
.guide-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.25s, box-shadow 0.25s;
}
.guide-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.13);
}
.guide-card__verified {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--thm-primary, #c9a84c);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  z-index: 2;
  letter-spacing: 0.3px;
}
.guide-card__photo-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f0f0f0;
}
.guide-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.guide-card:hover .guide-card__photo { transform: scale(1.05); }

.guide-card__body {
  padding: 20px 20px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.guide-card__name {
  font-size: 18px;
  font-weight: 700;
  color: var(--thm-black, #1a1a1a);
  margin: 0;
}
.guide-card__tagline {
  font-size: 13px;
  color: #777;
  line-height: 1.5;
  margin: 0;
}
.guide-card__meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.guide-card__meta-item {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}
.guide-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.guide-card__tag {
  background: #f5f0e8;
  color: var(--thm-primary, #c9a84c);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.guide-card__langs {
  font-size: 12px;
  color: #999;
}
.guide-card__langs-label {
  font-weight: 600;
  color: #666;
  margin-right: 4px;
}

/* Rating */
.guide-card__rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.guide-card__stars { display: flex; gap: 2px; }
.guide-card__star {
  font-size: 15px;
  color: #ddd;
  line-height: 1;
}
.guide-card__star.filled { color: #f4b400; }
.guide-card__rating-num {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}
.guide-card__review-count {
  font-size: 12px;
  color: #aaa;
}

/* Footer */
.guide-card__footer {
  padding: 14px 20px 20px;
  border-top: 1px solid #f0f0f0;
}
.guide-card__wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #25d366;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}
.guide-card__wa-btn:hover {
  background: #1ebe5d;
  transform: scale(1.02);
  color: #fff;
}
.guide-card__login-cta {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  border: 2px dashed var(--thm-primary, #c9a84c);
  color: var(--thm-primary, #c9a84c);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.guide-card__login-cta:hover {
  background: #fffaf0;
  color: var(--thm-primary, #c9a84c);
}

/* Empty state */
.guides-page__empty {
  text-align: center;
  padding: 80px 20px;
  color: #aaa;
}
.guides-page__empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
.guides-page__empty h3 { color: #555; font-size: 22px; margin-bottom: 8px; }
.guides-page__empty p { margin-bottom: 24px; }
</style>
