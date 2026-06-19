<template>
    <div class="search-popup" :class="{ 'active': isActive }">
        <div class="search-popup__overlay search-toggler" @click="closePopup"></div>
        <!-- /.search-popup__overlay -->
        <div class="search-popup__content">
            <form action="#" @submit.prevent>
                <label for="search" class="sr-only">search here</label><!-- /.sr-only -->
                <input type="text" id="search" placeholder="Search Here..." ref="searchInput" />
                <button type="submit" aria-label="search submit" class="thm-btn">
                    <i class="fas fa-search"></i>
                </button>
            </form>
        </div>
        <!-- /.search-popup__content -->
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const isActive = ref(false);
const searchInput = ref(null);

const openPopup = () => {
    isActive.value = true;
    document.body.classList.add('locked');
    
    // Add click listener after a small delay to prevent immediate closing
    nextTick(() => {
        setTimeout(() => {
            document.addEventListener('click', handleDocumentClick, true);
        }, 100);
    });
    
    // Focus the input when popup opens
    setTimeout(() => {
        if (searchInput.value) {
            searchInput.value.focus();
        }
    }, 300);
};

const closePopup = () => {
    isActive.value = false;
    document.body.classList.remove('locked');
    document.removeEventListener('click', handleDocumentClick, true);
};

const handleDocumentClick = (e) => {
    const searchForm = document.querySelector('.search-popup__content form');
    
    // If clicking outside the search form, close the popup
    if (searchForm && !searchForm.contains(e.target)) {
        closePopup();
    }
};

const togglePopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isActive.value) {
        closePopup();
    } else {
        openPopup();
    }
    
    // Close mobile nav if open
    const mobileNav = document.querySelector('.mobile-nav__wrapper');
    if (mobileNav) {
        mobileNav.classList.remove('expanded');
    }
};

onMounted(() => {
    // Listen for clicks on search-toggler elements
    const searchTogglers = document.querySelectorAll('.search-toggler');
    searchTogglers.forEach(toggler => {
        toggler.addEventListener('click', togglePopup);
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape' && isActive.value) {
            closePopup();
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Cleanup on unmount
    onBeforeUnmount(() => {
        searchTogglers.forEach(toggler => {
            toggler.removeEventListener('click', togglePopup);
        });
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleDocumentClick, true);
    });
});
</script>




