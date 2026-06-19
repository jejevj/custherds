<template>
    <ul :class="ulClass">
        <li v-for="(item, index) in navItems" :key="index" :class="{ dropdown: item.dropdown, current: isItemActive(item), expanded: isExpanded(item.name) }">
            
            <router-link v-if="item.path !== '#'" :to="item.path" :class="{ expanded: isExpanded(item.name) }" @click="$emit('close')">
                {{ item.name }}
                <button v-if="item.dropdown" class="dropdown-btn" :class="{ expanded: isExpanded(item.name) }" @click.prevent.stop="toggleExpand(item.name)" aria-label="dropdown toggler">
                    <i class="fa fa-angle-down"></i>
                </button>
            </router-link>
            
            <a v-else href="#" :class="{ expanded: isExpanded(item.name) }" @click.prevent="toggleExpand(item.name)">
                {{ item.name }}
                <button v-if="item.dropdown" class="dropdown-btn" :class="{ expanded: isExpanded(item.name) }" @click.prevent.stop="toggleExpand(item.name)" aria-label="dropdown toggler">
                    <i class="fa fa-angle-down"></i>
                </button>
            </a>
            
            <ul v-if="item.dropdown" v-slide="isExpanded(item.name)">
                <li v-for="(sub, subIndex) in item.subItems" :key="subIndex" 
                    :class="{ dropdown: sub.dropdown, current: isItemActive(sub), expanded: isExpanded(sub.name) }">
                    
                    <router-link v-if="sub.path !== '#'" :to="sub.path" :class="{ expanded: isExpanded(sub.name) }" @click="$emit('close')">
                        {{ sub.name }}
                        <button v-if="sub.dropdown" class="dropdown-btn" :class="{ expanded: isExpanded(sub.name) }" @click.prevent.stop="toggleExpand(sub.name)" aria-label="dropdown toggler">
                            <i class="fa fa-angle-down"></i>
                        </button>
                    </router-link>
                    
                    <a v-else href="#" :class="{ expanded: isExpanded(sub.name) }" @click.prevent="toggleExpand(sub.name)">
                        {{ sub.name }}
                        <button v-if="sub.dropdown" class="dropdown-btn" :class="{ expanded: isExpanded(sub.name) }" @click.prevent.stop="toggleExpand(sub.name)" aria-label="dropdown toggler">
                            <i class="fa fa-angle-down"></i>
                        </button>
                    </a>
                    
                    <ul v-if="sub.dropdown" v-slide="isExpanded(sub.name)">
                        <li v-for="(ssub, ssubIndex) in sub.subItems" :key="ssubIndex" :class="{ current: isItemActive(ssub) }">
                            <router-link :to="ssub.path" @click="$emit('close')">{{ ssub.name }}</router-link>
                        </li>
                    </ul>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
import { navItems } from '@/data/nav-items.js';

export default {
    name: "NavLinks",
    props: {
        ulClass: {
            type: String,
            default: "main-menu__list"
        }
    },
    data() {
        return {
            navItems,
            expandedItems: []
        };
    },
    directives: {
        slide: {
            mounted(el, binding) {
                if (window.innerWidth <= 1199) {
                    el.style.display = binding.value ? 'block' : 'none';
                } else {
                    el.style.display = '';
                }
            },
            updated(el, binding) {
                if (binding.value === binding.oldValue) return;
                
                if (window.innerWidth > 1199) {
                    el.style.display = '';
                    el.style.height = '';
                    el.style.overflow = '';
                    return;
                }

                if (binding.value) {
                    el.style.display = 'block';
                    el.style.height = '0px';
                    el.style.overflow = 'hidden';
                    el.offsetHeight; // reflow
                    el.style.transition = 'height 0.3s ease';
                    el.style.height = el.scrollHeight + 'px';
                    
                    const cleanup = (e) => {
                        if (e && e.target !== el) return;
                        el.style.height = 'auto';
                        el.style.overflow = '';
                        el.style.transition = '';
                        el.removeEventListener('transitionend', cleanup);
                    };
                    el.addEventListener('transitionend', cleanup);
                    setTimeout(cleanup, 350);
                } else {
                    el.style.height = el.scrollHeight + 'px';
                    el.style.overflow = 'hidden';
                    el.offsetHeight; // reflow
                    el.style.transition = 'height 0.3s ease';
                    el.style.height = '0px';
                    
                    const cleanup = (e) => {
                        if (e && e.target !== el) return;
                        el.style.display = 'none';
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.transition = '';
                        el.removeEventListener('transitionend', cleanup);
                    };
                    el.addEventListener('transitionend', cleanup);
                    setTimeout(cleanup, 350);
                }
            }
        }
    },
    methods: {
        isItemActive(item) {
            if (item.path !== '#' && this.$route.path === item.path) return true;
            if (item.subItems) {
                return item.subItems.some(sub => {
                    if (sub.path !== '#' && this.$route.path === sub.path) return true;
                    if (sub.subItems) return sub.subItems.some(ssub => this.$route.path === ssub.path);
                    return false;
                });
            }
            return false;
        },
        isExpanded(name) {
            return this.expandedItems.includes(name);
        },
        toggleExpand(name) {
            if (this.isExpanded(name)) {
                this.expandedItems = this.expandedItems.filter(i => i !== name);
            } else {
                this.expandedItems.push(name);
            }
        }
    }
};
</script>

<style scoped>
/* Hidden by default on desktop, shown on mobile via Parent CSS if needed */
.dropdown-btn {
    display: none;
}

@media (max-width: 1199px) {
    .dropdown-btn {
        display: flex;
    }
}
</style>
