<template>
    <a href="#" @click.prevent="scrollToTop" class="scroll-to-target scroll-to-top" :class="{ show: visible }">
        <span class="scroll-to-top__wrapper"><span class="scroll-to-top__inner"></span></span>
        <span class="scroll-to-top__text"> Go Back Top</span>
    </a>
</template>

<script>
export default {
    name: "ScrollToTop",
    data() {
        return {
            visible: false
        }
    },
    methods: {
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    },
    mounted() {
        this._onScroll = () => {
            this.visible = window.scrollY > 500;
        };
        window.addEventListener("scroll", this._onScroll, { passive: true });
    },
    beforeUnmount() {
        if (this._onScroll) {
            window.removeEventListener("scroll", this._onScroll);
        }
    }
};
</script>
