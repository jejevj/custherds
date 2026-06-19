/**
 * Pure-JS accordion initializer replacing jQuery accordions.
 * @param {HTMLElement} container  - the root element to scope querySelectorAll
 * @returns {Function}  cleanup function to remove event listeners
 */
export function initAccordion(container) {
    const groups = container.querySelectorAll(".accrodion-grp");
    const cleanups = [];

    groups.forEach((grp) => {
        const grpName = grp.dataset.grpName || "";
        if (grpName) grp.classList.add(grpName);

        // Hide all content panels, show active one
        grp.querySelectorAll(".accrodion .accrodion-content").forEach((c) => {
            c.style.display = "none";
            c.style.overflow = "hidden";
            c.style.transition = "max-height 0.4s ease, opacity 0.4s ease";
        });
        const activeAccrodion = grp.querySelector(".accrodion.active");
        if (activeAccrodion) {
            const content = activeAccrodion.querySelector(".accrodion-content");
            if (content) content.style.display = "block";
        }

        // Click handlers
        grp.querySelectorAll(".accrodion").forEach((acc) => {
            const titleEl = acc.querySelector(".accrodion-title");
            if (!titleEl) return;

            const handler = () => {
                const isActive = acc.classList.contains("active");
                if (!isActive) {
                    // Close all in group
                    grp.querySelectorAll(".accrodion").forEach((a) => {
                        a.classList.remove("active");
                        const c = a.querySelector(".accrodion-content");
                        if (c) c.style.display = "none";
                    });
                    // Open clicked
                    acc.classList.add("active");
                    const content = acc.querySelector(".accrodion-content");
                    if (content) content.style.display = "block";
                }
            };

            titleEl.addEventListener("click", handler);
            cleanups.push(() => titleEl.removeEventListener("click", handler));
        });
    });

    return () => cleanups.forEach((fn) => fn());
}
