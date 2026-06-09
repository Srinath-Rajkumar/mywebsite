/**
 * Page-load loader overlay.
 * Progress is driven by readyState transitions + window load event.
 * Auto-removes from DOM after the fade so it never blocks input.
 */
(function initLoader() {
    const overlay = document.getElementById('sr-loader');
    if (!overlay) return;

    const fill = overlay.querySelector('.sr-loader__ring');
    const pct = overlay.querySelector('.sr-loader__pct');

    let progress = 0;
    let raf = 0;
    let target = 10;

    const setProgress = (value) => {
        progress += (value - progress) * 0.15;
        if (Math.abs(value - progress) < 0.4) progress = value;

        if (fill) fill.style.setProperty('--p', progress.toFixed(1));
        if (pct) pct.textContent = `${Math.round(progress)}%`;

        if (progress < target - 0.5) {
            raf = requestAnimationFrame(() => setProgress(target));
        }
    };

    // Bump target as document advances.
    const bump = (value) => {
        target = Math.max(target, value);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setProgress(target));
    };

    if (document.readyState === 'interactive') bump(55);
    if (document.readyState === 'complete') bump(95);

    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'interactive') bump(55);
        if (document.readyState === 'complete') bump(95);
    });

    const finish = () => {
        bump(100);
        setTimeout(() => {
            overlay.classList.add('is-hidden');
            overlay.addEventListener(
                'transitionend',
                () => overlay.remove(),
                { once: true }
            );
            // Safety net: force removal even without transitionend.
            setTimeout(() => overlay.remove(), 900);
        }, 220);
    };

    if (document.readyState === 'complete') {
        // Defer so the first paint shows the ring briefly.
        setTimeout(finish, 250);
    } else {
        window.addEventListener('load', finish, { once: true });
        // Hard fallback so a stalled asset never traps the user.
        setTimeout(finish, 4500);
    }
})();
