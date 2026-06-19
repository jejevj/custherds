<template>
  <Teleport to="body">
    <div v-if="modelValue" class="video-modal">
      <div class="video-overlay" @click="close"></div>

      <div class="video-content">
        <button class="close-btn" @click="close">×</button>

        <iframe
          :src="embedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed } from "vue";

export default {
  name: "VideoPopup",
  props: {
    modelValue: Boolean,
    videoUrl: String
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {

    const embedUrl = computed(() => {
      try {
        const url = new URL(props.videoUrl);
        const id = url.searchParams.get("v");
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      } catch {
        return "";
      }
    });

    const close = () => {
      emit("update:modelValue", false);
    };

    return { embedUrl, close };
  }
};
</script>

<style>
/* IMPORTANT: remove scoped so it works globally */
.video-modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999; /* higher than header */
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
}

.video-content {
  position: relative;
  width: 90%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  background: #000;
  z-index: 10;
}

.video-content iframe {
  width: 100%;
  height: 100%;
}

.close-btn {
  position: absolute;
  top: -15px;
  right: -15px;
  background: #fff;
  border: none;
  font-size: 22px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
