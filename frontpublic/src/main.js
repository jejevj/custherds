import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js';
import { AnimationsPlugin } from './utils/animations.js';

// css
import '@/assets/css/bootstrap.min.css'
import '@/assets/css/animate.min.css'
import '@/assets/css/custom-animate.css'
import '@/assets/css/swiper.min.css'
import '@/assets/css/font-awesome-all.css'
import '@/assets/css/jarallax.css'
import '@/assets/css/odometer.min.css'
import '@/assets/css/flaticon.css'
import '@/assets/css/twentytwenty.css'

import '@/assets/css/module-css/slider.css'
import '@/assets/css/module-css/footer.css'
import '@/assets/css/module-css/feature.css'
import '@/assets/css/module-css/about.css'
import '@/assets/css/module-css/sliding-text.css'
import '@/assets/css/module-css/services.css'
import '@/assets/css/module-css/projects.css'
import '@/assets/css/module-css/design-interior.css'
import '@/assets/css/module-css/testimonial.css'
import '@/assets/css/module-css/video.css'
import '@/assets/css/module-css/awards.css'
import '@/assets/css/module-css/blog.css'
import '@/assets/css/module-css/brand.css'
import '@/assets/css/module-css/counter.css'
import '@/assets/css/module-css/team.css'
import '@/assets/css/module-css/contact.css'
import '@/assets/css/module-css/before-after.css'
import '@/assets/css/module-css/how-it-work.css'
import '@/assets/css/module-css/page-header.css'
import '@/assets/css/module-css/error-page.css'
import '@/assets/css/module-css/google-map.css'
import '@/assets/css/module-css/faq.css'
import '@/assets/css/module-css/coming-soon.css'
import '@/assets/css/module-css/united-kingdom.css'

import '@/assets/css/style.css'
import '@/assets/css/responsive.css'

const app = createApp(App)

app.use(router)
app.use(AnimationsPlugin, { router })
app.mount('#app')

