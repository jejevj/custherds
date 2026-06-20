/**
 * animations.js — Pure JS WOW.js + GSAP replacement for Vue 3 SPA.
 *
 * Registered as a Vue plugin in main.js.
 * Runs initAllAnimations() via router.afterEach → nextTick → setTimeout
 * so that Vue components are fully rendered in the DOM before we query them.
 *
 * NOTE: .wow { visibility: hidden } CSS is in index.html <head>
 *       so elements are hidden before Vue even mounts — no flash.
 */

import { nextTick } from 'vue';

/* ─── WOW.js replacement ─────────────────────────────────────────────────── */
let _wowObserver = null;

export function initWow() {
    if (_wowObserver) {
        _wowObserver.disconnect();
        _wowObserver = null;
    }

    const wowEls = document.querySelectorAll('.wow:not(.animated)');
    console.log(`[WOW] Initializing ${wowEls.length} elements`);
    if (!wowEls.length) return;

    _wowObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;

                const delay = el.getAttribute('data-wow-delay') || '0s';
                const duration = el.getAttribute('data-wow-duration') || '1s';
                const iteration = el.getAttribute('data-wow-iteration') || '1';

                el.style.animationDelay = delay;
                el.style.animationDuration = duration;
                el.style.animationIterationCount = iteration;

                el.style.visibility = 'visible';
                el.style.animationName = '';

                el.classList.add('animated');
                _wowObserver.unobserve(el);
            });
        },
        {
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1,
        }
    );

    wowEls.forEach((el) => {
        if (!el.classList.contains('animated')) {
            el.style.visibility = 'hidden';
            el.style.animationName = 'none';
        }
        _wowObserver.observe(el);
    });
}

/* ─── GSAP ScrollTrigger animations ─────────────────────────────────────── */
let _gsapPluginsRegistered = false;

function ensureGsap() {
    if (_gsapPluginsRegistered) return;
    const g = window.gsap;
    const ST = window.ScrollTrigger;
    if (!g || !ST) return;
    g.registerPlugin(ST);
    if (window.SplitText) g.registerPlugin(window.SplitText);
    g.config({ nullTargetWarn: false, trialWarn: false });
    _gsapPluginsRegistered = true;
}

export function initGsapAnimations() {
    ensureGsap();
    const g = window.gsap;
    const ST = window.ScrollTrigger;
    if (!g || !ST) return;

    if (window.SplitText) {
        document.querySelectorAll('.title-animation:not([data-gsap-init])').forEach((el) => {
            el.setAttribute('data-gsap-init', '1');
            const split = new window.SplitText(el, { type: 'chars,words' });
            g.from(split.chars, {
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.025,
                ease: 'power3.out',
            });
        });
    } else {
        document.querySelectorAll('.title-animation:not([data-gsap-init])').forEach((el) => {
            el.setAttribute('data-gsap-init', '1');
            g.from(el, {
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out',
            });
        });
    }

    document.querySelectorAll('.sec-title-animation:not([data-gsap-init])').forEach((el) => {
        el.setAttribute('data-gsap-init', '1');
        g.from(el, {
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out',
        });
    });

    document.querySelectorAll('.animation-style1:not([data-gsap-init])').forEach((el) => {
        el.setAttribute('data-gsap-init', '1');
        g.from(el, {
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            opacity: 0,
            y: 50,
            duration: 0.9,
            ease: 'power3.out',
        });
    });

    document.querySelectorAll('.animation-style2:not([data-gsap-init])').forEach((el) => {
        el.setAttribute('data-gsap-init', '1');
        g.from(el, {
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            opacity: 0,
            x: -60,
            duration: 0.9,
            ease: 'power3.out',
        });
    });

    ST.refresh();
}

/* ─── Jarallax re-init ───────────────────────────────────────────────────── */
export function initJarallax() {
    if (typeof window.jarallax !== 'function') return;
    const els = document.querySelectorAll('.jarallax:not([data-jarallax-init])');
    if (!els.length) return;
    window.jarallax(els, { speed: 0.3 });
    els.forEach((el) => el.setAttribute('data-jarallax-init', '1'));
}

/* ─── Global DOM Events (Event Delegation) ────────────────────────────────── */
export function setupGlobalEvents() {
    if (window._globalEventsInit) return;
    window._globalEventsInit = true;

    // Hover Image Reveal logic
    // Guard: e.target must be a real Element before calling .closest()
    document.addEventListener("mousemove", (e) => {
        if (!(e.target instanceof Element)) return;
        const item = e.target.closest(".hover-item");
        if (!item) return;
        const box = item.querySelector(".hover-item__box");
        const img = item.querySelector(".hover-item__box-img");
        if (box) {
            box.style.opacity = "1";
            box.style.transform = "translate(-100%, -50%) rotate(0deg)";
            box.style.left = `${e.clientX}px`;
        }
        if (img) {
            img.style.transform = "scale(1, 1)";
        }
    }, { passive: true });

    document.addEventListener("mouseleave", (e) => {
        if (!(e.target instanceof Element)) return;
        const item = e.target.closest(".hover-item");
        if (!item) return;
        const box = item.querySelector(".hover-item__box");
        const img = item.querySelector(".hover-item__box-img");
        if (box) {
            box.style.opacity = "0";
            box.style.transform = "translate(-50%, -50%) rotate(0deg)";
        }
        if (img) {
            img.style.transform = "scale(0.8, 0.8)";
        }
    }, true);

    // Full Height utility
    const updateFullHeight = () => {
        document.querySelectorAll(".full-height").forEach(el => {
            el.style.height = `${window.innerHeight}px`;
        });
    };
    updateFullHeight();
    window.addEventListener("resize", updateFullHeight, { passive: true });
}

/* ─── Master init ────────────────────────────────────────────────────────── */
export function initAllAnimations() {
    initWow();
    initGsapAnimations();
    initJarallax();
}

/* ─── Vue Plugin ─────────────────────────────────────────────────────────── */
export const AnimationsPlugin = {
    install(app, { router }) {
        setupGlobalEvents();

        router.afterEach(() => {
            nextTick(() => {
                setTimeout(initAllAnimations, 120);
            });
        });

        window.__initWow = initWow;
        window.__initAllAnimations = initAllAnimations;
    },
};
