<template>
    <ul class="main-menu__list one-page-scroll-menu">
        <li v-for="item in menuItems" :key="item.id" :class="['scrollToLink', { current: activeSection === item.id, dropdown: item.dropdown, expanded: isExpanded(item.id) }]">
            
            <a :href="'#' + item.id" :class="{ expanded: isExpanded(item.id) }" @click.prevent="$emit('scroll-to', item.id)">
                {{ item.name }}
                <button v-if="item.dropdown" class="dropdown-btn" :class="{ expanded: isExpanded(item.id) }" @click.prevent.stop="toggleExpand(item.id)" aria-label="dropdown toggler">
                    <i class="fa fa-angle-down"></i>
                </button>
            </a>
            
            <ul v-if="item.dropdown" v-slide="isExpanded(item.id)">
                <li v-for="sub in item.dropdown" :key="sub.path">
                    <router-link :to="sub.path" @click="$emit('close')">{{ sub.name }}</router-link>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
export default {
    name: "NavLinksOnePage",
    props: {
        activeSection: {
            type: String,
            default: 'home'
        },
        menuItems: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
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
        isExpanded(id) {
            return this.expandedItems.includes(id);
        },
        toggleExpand(id) {
            if (this.isExpanded(id)) {
                this.expandedItems = this.expandedItems.filter(i => i !== id);
            } else {
                this.expandedItems.push(id);
            }
        }
    }
};
</script>

<style scoped>
.dropdown-btn {
    display: none;
}
@media (max-width: 1199px) {
    .dropdown-btn {
        display: flex;
    }
}
</style>
