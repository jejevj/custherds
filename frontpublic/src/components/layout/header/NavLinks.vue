<template>
    <ul :class="ulClass">
        <!-- Regular nav items -->
        <li v-for="(item, index) in navItems" :key="index"
            :class="{ current: isItemActive(item) }">
            <router-link :to="item.path" @click="$emit('close')">
                {{ item.name }}
            </router-link>
        </li>

        <!-- Register/Login button with dropdown -->
        <li class="nav-register-btn" :class="{ expanded: registerOpen }">
            <a href="#" class="thm-btn nav-register__toggle" @click.prevent="toggleRegister">
                Register / Login <i class="fa fa-angle-down" style="margin-left: 6px;"></i>
            </a>
            <ul class="nav-register__dropdown" v-show="registerOpen">
                <li v-for="(reg, i) in registerItems" :key="i">
                    <a :href="reg.url" target="_blank" @click="registerOpen = false">{{ reg.name }}</a>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
import { navItems, registerItems } from '@/data/nav-items.js';

export default {
    name: "NavLinks",
    props: {
        ulClass: {
            type: String,
            default: "main-menu__list"
        }
    },
    emits: ['close'],
    data() {
        return {
            navItems,
            registerItems,
            registerOpen: false
        };
    },
    methods: {
        isItemActive(item) {
            return this.$route.path === item.path;
        },
        toggleRegister() {
            this.registerOpen = !this.registerOpen;
        }
    },
    mounted() {
        document.addEventListener('click', (e) => {
            if (!this.$el.contains(e.target)) {
                this.registerOpen = false;
            }
        });
    }
};
</script>

<style scoped>
.nav-register-btn {
    position: relative;
    display: flex;
    align-items: center;
}

.nav-register__toggle {
    padding: 8px 22px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    display: inline-flex;
    align-items: center;
}

.nav-register__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    min-width: 200px;
    list-style: none;
    padding: 8px 0;
    margin: 0;
    z-index: 999;
}

.nav-register__dropdown li a {
    display: block;
    padding: 10px 20px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;
}

.nav-register__dropdown li a:hover {
    background: #f5f5f5;
    color: var(--thm-primary, #c9a84c);
}

@media (max-width: 1199px) {
    .nav-register-btn {
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-register__dropdown {
        position: static;
        box-shadow: none;
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
        width: 100%;
    }

    .nav-register__dropdown li a {
        color: #fff;
    }

    .nav-register__dropdown li a:hover {
        background: rgba(255,255,255,0.1);
        color: var(--thm-primary, #c9a84c);
    }
}
</style>
