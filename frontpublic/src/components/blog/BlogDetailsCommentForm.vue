<template>
    <div class="comment-form">
        <h3 class="comment-form__title">Leave A Comment</h3>
        <form @submit.prevent="handleSubmit" class="comment-one__form contact-form-validated">
            <div class="row">
                <div class="col-xl-6">
                    <div class="comment-form__input-box">
                        <input 
                            v-model="formData.name"
                            type="text" 
                            placeholder="Name*" 
                            name="name"
                            required
                        >
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="comment-form__input-box">
                        <input 
                            v-model="formData.email"
                            type="email" 
                            placeholder="E-mail *" 
                            name="email"
                            required
                        >
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xl-12">
                    <div class="comment-form__input-box text-message-box">
                        <textarea 
                            v-model="formData.message"
                            name="message" 
                            placeholder="Your Comments*"
                            required
                        ></textarea>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="checked-box1">
                        <input 
                            v-model="formData.saveInfo"
                            type="checkbox" 
                            name="skipper1" 
                            id="skipper"
                        >
                        <label for="skipper">
                            <span></span>Save my name, email & website in this browser for the next time I comment.
                        </label>
                    </div>
                    <div class="button-box">
                        <button type="submit" class="thm-btn">
                            Send Massage
                            <span class="icon-up-right-arrow"></span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
        <div class="result"></div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({
    name: '',
    email: '',
    message: '',
    saveInfo: true
});

const emit = defineEmits(['submit']);

const handleSubmit = () => {
    emit('submit', { ...formData });
    
    // Reset form
    formData.name = '';
    formData.email = '';
    formData.message = '';
    formData.saveInfo = true;
};
</script>
