/**
 * Motion & performance guard.
 * Exposes window.SR.motionOK and window.SR.isTouch for feature modules.
 * Effects that depend on smooth, sustained animation (canvas, cursor, parallax,
 * magnetic) must check motionOK; lightweight UI (loader, palette) ignores it.
 */
(function initMotionGuard() {
    const ns = (window.SR = window.SR || {});

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isDesktopWidth = window.matchMedia('(min-width: 769px)').matches;

    ns.reduceMotion = reduceMotion;
    ns.isTouch = isTouch;
    ns.motionOK = !reduceMotion && isDesktopWidth && !isTouch;

    // Reflect on <html> so CSS can react too.
    const root = document.documentElement;
    root.classList.toggle('sr-motion-ok', ns.motionOK);
    root.classList.toggle('sr-touch', isTouch);
    root.classList.toggle('sr-reduce-motion', reduceMotion);
})();
