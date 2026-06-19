<template>
    <div class="xs-sidebar-group info-group info-sidebar">
        <div class="xs-overlay xs-bg-black" @click="close"></div>
        <div class="xs-sidebar-widget">
            <div class="sidebar-widget-container">
                <div class="widget-heading">
                    <a href="#" class="close-side-widget" @click.prevent="close">X</a>
                </div>
                <div class="sidebar-textwidget">
                    <div class="sidebar-info-contents">
                        <div class="content-inner">
                            <div class="logo">
                                <router-link to="/"><img src="@/assets/images/resources/logo-1.png" alt="" /></router-link>
                            </div>
                            <div class="content-box">
                                <h4>About Us</h4>
                                <p>Lorem ipsum dolor sit amet, consectetur elit, sed do eiusmod tempor incididunt ut
                                    labore et magna aliqua.</p>
                            </div>
                            <div class="form-inner">
                                <h4>Get a free quote</h4>
                                <form @submit.prevent="handleSubmit">
                                    <div class="form-group">
                                        <input type="text" v-model="form.name" placeholder="Name" required>
                                    </div>
                                    <div class="form-group">
                                        <input type="email" v-model="form.email" placeholder="Email" required>
                                    </div>
                                    <div class="form-group">
                                        <textarea v-model="form.message" placeholder="Message..." required></textarea>
                                    </div>
                                    <div class="form-group message-btn">
                                        <button type="submit" class="thm-btn form-inner__btn">Submit Now</button>
                                    </div>
                                    <div class="result" v-if="formResult">{{ formResult }}</div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SidebarWidget",
    data() {
        return {
            form: { name: '', email: '', message: '' },
            formResult: ''
        };
    },
    mounted() {
        this.$nextTick(() => {
            // Pure JS: listen for navSidebar-button clicks anywhere in document
            this._onOpen = (e) => {
                const btn = e.target.closest('.navSidebar-button');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();
                this.$el.classList.add('isActive');
            };
            document.addEventListener('click', this._onOpen);
        });
    },
    beforeUnmount() {
        if (this._onOpen) document.removeEventListener('click', this._onOpen);
    },
    methods: {
        close() {
            this.$el.classList.remove('isActive');
        },
        async handleSubmit() {
            try {
                const res = await fetch('assets/inc/sendemail.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                if (res.ok) {
                    this.formResult = 'Message sent successfully!';
                    this.form = { name: '', email: '', message: '' };
                } else {
                    this.formResult = 'Error sending message. Please try again.';
                }
            } catch {
                this.formResult = 'Error sending message. Please try again.';
            }
        }
    }
};
</script>
