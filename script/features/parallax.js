/**
 * Scroll progress bar + per-element parallax CSS var.
 * Uses a single rAF tick driven by scroll/resize for the bar, and
 * IntersectionObserver to mark which elements are in view so we only
 * write the --sp (scroll-progress) variable on visible nodes.
 */
(function initParallax() {
    const bar = document.getElementById('sr-scroll-progress');
    const allowMotion = !!(window.SR && window.SR.motionOK);

    const targets = allowMotion
        ? Array.from(
              document.querySelectorAll(
                  '.section-title, .timeline-content, .project-card, .hero-subtitle'
              )
          )
        : [];

    const visible = new Set();

    if (targets.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) visible.add(entry.target);
                    else visible.delete(entry.target);
                }
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] }
        );
        targets.forEach((el) => io.observe(el));
    }

    let ticking = false;

    const update = () => {
        ticking = false;

        if (bar) {
            const max = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight
            );
            const pct = Math.min(1, Math.max(0, window.scrollY / max));
            bar.style.transform = `scaleX(${pct})`;
        }

        if (visible.size) {
            const vh = window.innerHeight;
            visible.forEach((el) => {
                const rect = el.getBoundingClientRect();
                // Progress: -1 (just entered from bottom) → 0 (center) → 1 (leaving top).
                const center = rect.top + rect.height / 2;
                const sp = (center - vh / 2) / (vh / 2);
                el.style.setProperty('--sp', sp.toFixed(3));
            });
        }
    };

    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
})();
