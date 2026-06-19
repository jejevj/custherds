/**
 * Pure-JS replacement for jQuery .appear().
 * Calls `callback(entry.target)` once when the element scrolls into view.
 * Returns the observer so the caller can disconnect() it in beforeUnmount.
 *
 * @param {NodeList|Element[]} elements
 * @param {Function} callback  - receives the DOM element
 * @param {IntersectionObserverInit} [options]
 * @returns {IntersectionObserver}
 */
export function onceVisible(elements, callback, options = { threshold: 0.15 }) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target); // fire only once
            }
        });
    }, options);

    (Array.isArray(elements) ? elements : Array.from(elements))
        .forEach((el) => observer.observe(el));

    return observer;
}

/**
 * Animates a number from 0 up to `target` over `duration` ms.
 * Calls `onUpdate(currentValue)` each frame, `onDone` when finished.
 *
 * @param {number} target
 * @param {number} duration   ms
 * @param {Function} onUpdate
 * @param {Function} [onDone]
 * @returns {{ stop: Function }}
 */
export function animateCounter(target, duration, onUpdate, onDone) {
    const start = performance.now();
    let raf;

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.ceil(eased * target);
        onUpdate(current);
        if (progress < 1) {
            raf = requestAnimationFrame(step);
        } else {
            onDone && onDone();
        }
    }

    raf = requestAnimationFrame(step);
    return { stop: () => cancelAnimationFrame(raf) };
}
