export const headerMixin = {
    data() {
        return {
            isSticky: false
        };
    },
    methods: {
        handleScroll() {
            const st = Math.max(0, window.pageYOffset || document.documentElement.scrollTop);

            // Show sticky after 120px
            const offset = 120;

            this.isSticky = st > offset;
        }
    },
    mounted() {
        this._onHeaderScroll = () => this.handleScroll();
        window.addEventListener("scroll", this._onHeaderScroll, { passive: true });
        this.$nextTick(() => {
            this.handleScroll();
        });
    },
    beforeUnmount() {
        if (this._onHeaderScroll) {
            window.removeEventListener("scroll", this._onHeaderScroll);
        }
    }
};
