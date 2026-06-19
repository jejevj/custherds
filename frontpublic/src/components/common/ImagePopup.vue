<template>
  <Teleport to="body">
    <transition name="mfp-fade">
      <div v-if="modelValue" class="mfp-main-wrapper">
        <div class="mfp-bg mfp-ready" @click="close"></div>
        
        <div class="mfp-wrap mfp-gallery mfp-close-btn-in mfp-auto-cursor mfp-ready" tabindex="-1" @click.self="close">
          <div class="mfp-container mfp-s-ready mfp-image-holder" @click.self="close">
            <div class="mfp-content" @click.stop>
              <div class="mfp-figure">
                <button title="Close (Esc)" type="button" class="mfp-close" @click="close">×</button>
                <figure>
                  <img class="mfp-img" :src="currentImage" alt="Popup Image" :style="{ maxHeight: (windowHeight - 120) + 'px' }">
                  <figcaption>
                    <div class="mfp-bottom-bar">
                      <div class="mfp-title">{{ currentTitle }}</div>
                      <div class="mfp-counter">{{ activeIndex + 1 }} of {{ images.length }}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
            
            <button v-if="images.length > 1" title="Previous" type="button" class="mfp-arrow mfp-arrow-left" @click="prev"></button>
            <button v-if="images.length > 1" title="Next" type="button" class="mfp-arrow mfp-arrow-right" @click="next"></button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: "ImagePopup",
  props: {
    modelValue: Boolean,
    images: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  emits: ["update:modelValue", "update:initialIndex"],
  setup(props, { emit }) {
    const windowHeight = ref(window.innerHeight);

    const activeIndex = computed({
        get: () => props.initialIndex,
        set: (val) => emit('update:initialIndex', val)
    });

    const currentImage = computed(() => {
        if (!props.images || props.images.length === 0) return '';
        const item = props.images[activeIndex.value];
        if (!item) return '';
        return typeof item === 'string' ? item : (item.image || item.url || item.src || '');
    });

    const currentTitle = computed(() => {
         if (!props.images || props.images.length === 0) return '';
         const item = props.images[activeIndex.value];
         if (!item) return '';
         return typeof item === 'string' ? '' : (item.title || '');
    });

    const next = (e) => {
        if (e) e.stopPropagation();
        if (activeIndex.value < props.images.length - 1) {
            activeIndex.value++;
        } else {
            activeIndex.value = 0; 
        }
    };

    const prev = (e) => {
        if (e) e.stopPropagation();
        if (activeIndex.value > 0) {
            activeIndex.value--;
        } else {
            activeIndex.value = props.images.length - 1; 
        }
    };

    const close = () => {
      emit("update:modelValue", false);
    };

    const handleKeydown = (e) => {
        if (!props.modelValue) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    };

    const handleResize = () => {
        windowHeight.value = window.innerHeight;
    };

    watch(() => props.modelValue, (isOpen) => {
       if (isOpen) {
           document.documentElement.style.overflow = 'hidden';
       } else {
           document.documentElement.style.overflow = '';
       }
    });

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('resize', handleResize);
        if (props.modelValue) document.documentElement.style.overflow = 'hidden';
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('resize', handleResize);
        document.documentElement.style.overflow = '';
    });

    return { close, next, prev, currentImage, currentTitle, activeIndex, windowHeight };
  }
};
</script>

<style>
/* ── Pure-JS Lightbox Styles (MFP Compatible) ── */
.mfp-main-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1000000;
}

.mfp-bg {
  position: fixed;
  inset: 0;
  background: #0b0b0b;
  opacity: 0.8;
  z-index: 1042;
}

.mfp-wrap {
  position: fixed;
  inset: 0;
  z-index: 1043;
  outline: none !important;
  -webkit-backface-visibility: hidden;
}

.mfp-container {
  text-align: center;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  padding: 0 8px;
  box-sizing: border-box;
}

.mfp-container::before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}

.mfp-content {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin: 0 auto;
  text-align: left;
  z-index: 1045;
  max-width: 90%;
}

.mfp-figure {
  line-height: 0;
}

.mfp-figure::after {
  content: '';
  position: absolute;
  left: 0;
  top: 40px;
  bottom: 40px;
  display: block;
  right: 0;
  width: auto;
  height: auto;
  z-index: -1;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
  background: #444;
}

.mfp-figure figure {
  margin: 0;
}

.mfp-img {
  width: auto;
  max-width: 100%;
  height: auto;
  display: block;
  line-height: 0;
  box-sizing: border-box;
  padding: 0 0 40px;
  margin: 0 auto;
}

.mfp-close {
  width: 44px;
  height: 44px;
  line-height: 44px;
  position: absolute;
  right: -5px;
  top: -45px;
  text-decoration: none;
  text-align: center;
  opacity: 0.65;
  color: #FFF;
  font-style: normal;
  font-size: 35px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1046;
  transition: opacity 0.3s ease;
}

.mfp-close:hover {
  opacity: 1;
}

.mfp-bottom-bar {
  margin-top: -36px;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  cursor: auto;
  color: #CCC;
  line-height: 18px;
  text-align: left;
}

.mfp-title {
  text-align: left;
  word-wrap: break-word;
  padding-right: 36px;
}

.mfp-counter {
  position: absolute;
  top: 0;
  right: 0;
  color: #CCC;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

/* ── Arrows ── */
.mfp-arrow {
  position: absolute;
  opacity: 0.65;
  margin: 0;
  top: 50%;
  margin-top: -55px;
  width: 90px;
  height: 110px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 300ms ease;
  z-index: 1046;
}

.mfp-arrow:hover { 
  opacity: 1; 
}

.mfp-arrow-left { 
  left: 0; 
}

.mfp-arrow-right { 
  right: 0; 
}

.mfp-arrow::before, .mfp-arrow::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  position: absolute;
  left: 0;
  top: 0;
  margin-top: 35px;
  margin-left: 35px;
}

.mfp-arrow::after {
  top: 8px;
}

/* Vertical Midpoint for all: 35 + 21 = 56 for before, 35 + 8 + 13 = 56 for after. Aligned. */

/* Left Arrow (points left) */
.mfp-arrow-left::after {
  border-right: 17px solid #FFF;
  margin-left: 31px;
  border-top: 13px solid transparent;
  border-bottom: 13px solid transparent;
}
.mfp-arrow-left::before {
  border-right: 27px solid #3F3F3F;
  margin-left: 25px;
  border-top: 21px solid transparent;
  border-bottom: 21px solid transparent;
}

/* Right Arrow (points right) */
.mfp-arrow-right::after {
  border-left: 17px solid #FFF;
  margin-left: 39px;
  border-top: 13px solid transparent;
  border-bottom: 13px solid transparent;
}
.mfp-arrow-right::before {
  border-left: 27px solid #3F3F3F;
  margin-left: 35px;
  border-top: 21px solid transparent;
  border-bottom: 21px solid transparent;
}

/* Transitions */
.mfp-fade-enter-active, .mfp-fade-leave-active { 
    transition: opacity 0.3s ease; 
}
.mfp-fade-enter-active .mfp-content, .mfp-fade-leave-active .mfp-content {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.mfp-fade-enter-from, .mfp-fade-leave-to { 
    opacity: 0; 
}
.mfp-fade-enter-from .mfp-content, .mfp-fade-leave-to .mfp-content {
    transform: scale(0.95);
    opacity: 0;
}
</style>

