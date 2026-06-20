<template>
    <ul :class="ulClass">
        <!-- Regular nav items -->
        <li v-for="(item, index) in navItems" :key="index"
            :class="{ current: isItemActive(item) }">
            <router-link :to="item.path" @click="$emit('close')">
                {{ item.name }}
            </router-link>
        </li>

        <!-- Register button (filled) -->
        <li class="nav-action-btn">
            <router-link to="/register" class="nav-btn nav-btn--filled" @click="$emit('close')">
                Register
            </router-link>
        </li>

        <!-- Login button (outlined) -->
        <li class="nav-action-btn">
            <router-link to="/tourist/login" class="nav-btn nav-btn--outline" @click="$emit('close')">
                Login
            </router-link>
        </li>
    </ul>
</template>

<script>
import { navItems } from '@/data/nav-items.js';

export default {
    name: "NavLinks",
    props: {
        ulClass: { type: String, default: "main-menu__list" }
    },
    emits: ['close'],
    data() {
        return { navItems };
    },
    methods: {
        isItemActive(item) {
            return this.$route.path === item.path;
        }
    }
};
</script>

<style scoped>
.nav-action-btn {
    display: flex;
    align-items: center;
}

.nav-btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 22px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 30px;
    text-decoration: none;
    transition: all 0.3s ease;
    line-height: 1.4;
    white-space: nowrap;
    cursor: pointer;
}

.nav-btn--filled {
    background: var(--thm-primary, #c9a84c);
    color: #fff !important;
    border: 2px solid var(--thm-primary, #c9a84c);
}
.nav-btn--filled:hover {
    background: transparent;
    color: var(--thm-primary, #c9a84c) !important;
}

.nav-btn--outline {
    background: transparent;
    color: var(--thm-primary, #c9a84c) !important;
    border: 2px solid var(--thm-primary, #c9a84c);
}
.nav-btn--outline:hover {
    background: var(--thm-primary, #c9a84c);
    color: #fff !important;
}

@media (max-width: 1199px) {
    .nav-action-btn {
        margin-top: 8px;
    }
}
</style>
