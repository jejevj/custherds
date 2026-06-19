<template>
    <div class="contact-page__right">
        <h3 class="contact-page__contact-title">Get A Quote</h3>
        <form 
            id="contact-form" 
            class="contact-page__form contact-form-validated"
            @submit.prevent="handleSubmit"
        >
            <div class="row">
                <div class="col-lg-6">
                    <div class="contact-page__input-box">
                        <input 
                            v-model="formData.name"
                            type="text" 
                            name="name" 
                            placeholder="Your name" 
                            required
                        >
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="contact-page__input-box">
                        <input 
                            v-model="formData.email"
                            type="email" 
                            name="email" 
                            placeholder="Your Email" 
                            required
                        >
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="contact-page__input-box">
                        <input 
                            v-model="formData.phone"
                            type="number" 
                            placeholder="Mobile" 
                            name="phone" 
                            required
                        >
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="contact-page__input-box">
                        <input 
                            v-model="formData.subject"
                            type="text" 
                            placeholder="Subject" 
                            name="subject" 
                            required
                        >
                    </div>
                </div>
                <div class="col-xl-12">
                    <div class="contact-page__input-box text-message-box">
                        <textarea 
                            v-model="formData.message"
                            name="message" 
                            placeholder="Messege" 
                            required
                        ></textarea>
                    </div>
                    <div class="contact-page__btn-box">
                        <button 
                            type="submit" 
                            class="thm-btn contact-page__btn"
                            :disabled="isSubmitting"
                        >
                            {{ isSubmitting ? 'Please wait...' : 'Get Started' }}
                            <span class="icon-up-right-arrow"></span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="result"></div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const formData = reactive({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
});

const isSubmitting = ref(false);
const emit = defineEmits(['submit']);

const handleSubmit = async () => {
    isSubmitting.value = true;
    
    try {
        emit('submit', { ...formData });
        
        // Reset form after successful submission
        setTimeout(() => {
            formData.name = '';
            formData.email = '';
            formData.phone = '';
            formData.subject = '';
            formData.message = '';
            isSubmitting.value = false;
        }, 1000);
    } catch (error) {
        console.error('Form submission error:', error);
        isSubmitting.value = false;
    }
};
</script>
