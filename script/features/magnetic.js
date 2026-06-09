/**
 * Magnetic attraction for interactive elements.
 * Translates targets by a fraction of cursor delta when inside the radius,
 * with an eased return to origin on leave. Desktop / fine-pointer only.
 */
(function initMagnetic() {
    if (!window.SR || !window.SR.motionOK) return;

    const targets = document.querySelectorAll(
        '.btn, .contact-link, .theme-toggle-btn, .nav-links a'
    );
    if (!targets.length) return;

    const STRENGTH = 0.28;
    const RADIUS = 90;

    targets.forEach((el) => {
        let rafId = 0;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let active = false;

        const animate = () => {
            tx += (cx - tx) * 0.2;
            ty += (cy - ty) * 0.2;
            el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
            if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1 || active) {
                rafId = requestAnimationFrame(animate);
            } else {
                el.style.transform = '';
            }
        };

        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const ex = e.clientX - (rect.left + rect.width / 2);
            const ey = e.clientY - (rect.top + rect.height / 2);
            const dist = Math.hypot(ex, ey);
            if (dist > RADIUS + Math.max(rect.width, rect.height) / 2) return;
            cx = ex * STRENGTH;
            cy = ey * STRENGTH;
            if (!active) {
                active = true;
                rafId = requestAnimationFrame(animate);
            }
        };

        const onLeave = () => {
            active = false;
            cx = 0;
            cy = 0;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(animate);
        };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });
})();
