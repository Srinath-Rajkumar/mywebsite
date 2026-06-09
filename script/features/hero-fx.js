/**
 * Hero particle-network background.
 *
 * Two particle classes:
 *  - "regular" dots: drift slowly, magnetically attracted to the cursor.
 *  - "hero" dots (a handful): follow an autonomous orbital path, slowly
 *    rotate + breathe (expand/contract), and are gently nudged by the
 *    cursor without ever leaving their orbit (magnetic-but-tethered).
 *
 * Pauses when off-screen or tab hidden. Skipped on reduced-motion.
 */
(function initHeroFx() {
    if (!window.SR || window.SR.reduceMotion) return;

    const canvas = document.getElementById('hero-fx');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Treat narrow viewports as "touch-like" regardless of input device, so
    // DevTools device-mode toggling picks the lighter profile too.
    const isSmallViewport = () =>
        window.matchMedia('(max-width: 768px)').matches ||
        window.matchMedia('(pointer: coarse)').matches;

    let isTouch = isSmallViewport();

    let width = 0;
    let height = 0;
    let particles = [];
    let heroes = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let rafId = 0;
    let running = false;
    let tGlobal = 0;

    let driftT = Math.random() * 1000;

    // Mutable config — recomputed whenever viewport class flips.
    let COUNT = 0;
    let HERO_COUNT = 0;
    let LINK_DIST = 0;
    let MOUSE_RADIUS = 0;
    const HERO_LINK_BOOST = 1.35;

    const applyProfile = () => {
        isTouch = isSmallViewport();
        COUNT = isTouch ? 38 : 115;
        HERO_COUNT = isTouch ? 3 : 6;
        LINK_DIST = isTouch ? 112 : 160;
        MOUSE_RADIUS = isTouch ? 140 : 185;
    };
    applyProfile();

    const getAccent = () =>
        getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color')
            .trim() || '#A2D729';

    const hexToRgb = (hex) => {
        const cleaned = hex.replace('#', '');
        const expanded =
            cleaned.length === 3
                ? cleaned.split('').map((c) => c + c).join('')
                : cleaned;
        const num = parseInt(expanded, 16);
        return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
    };

    let accentRgb = hexToRgb(getAccent());
    let isLight = document.body.classList.contains('light-theme');

    const palette = () => ({
        dotAlpha: isLight ? 0.95 : 0.85,
        lineBase: isLight ? 0.55 : 0.38,
        haloAlpha: isLight ? 0.35 : 0,
        heroGlow: isLight ? 0.28 : 0.22,
    });

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
        particles = Array.from({ length: COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            r: Math.random() * 1.6 + 0.6,
        }));

        // Hero particles: each owns an elliptical orbit it lazily traces.
        // Cursor can deform the orbit but never break the tether.
        heroes = Array.from({ length: HERO_COUNT }, (_, i) => {
            const cx = width * (0.18 + Math.random() * 0.64);
            const cy = height * (0.22 + Math.random() * 0.56);
            return {
                cx,
                cy,
                // Live position (rendered) — eased toward orbit target.
                x: cx,
                y: cy,
                // Orbit geometry.
                rx: 70 + Math.random() * 90,
                ry: 50 + Math.random() * 80,
                // Independent angular speed + phase.
                omega: (Math.random() < 0.5 ? -1 : 1) * (0.0022 + Math.random() * 0.0028),
                phase: Math.random() * Math.PI * 2,
                // Slow rotation of the orbit ellipse itself.
                tilt: Math.random() * Math.PI,
                tiltOmega: (Math.random() < 0.5 ? -1 : 1) * 0.0007,
                // Breathing scale.
                baseR: 2.6 + Math.random() * 1.6,
                breatheT: Math.random() * Math.PI * 2,
                breatheOmega: 0.009 + Math.random() * 0.006,
                // Magnetic offset (cursor tug), eased back to 0.
                ox: 0,
                oy: 0,
                // Slot index for staggered visuals.
                idx: i,
            };
        });
    };

    const step = () => {
        tGlobal += 1;
        ctx.clearRect(0, 0, width, height);
        const { dotAlpha, lineBase, haloAlpha, heroGlow } = palette();

        if (isTouch) {
            driftT += 0.006;
            mouse.x = width * 0.5 + Math.sin(driftT) * width * 0.35;
            mouse.y = height * 0.5 + Math.cos(driftT * 0.8) * height * 0.32;
            mouse.active = true;
        }

        // --- Update + draw regular particles (magnetic to cursor) -----------
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            if (mouse.active) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_RADIUS && dist > 0.001) {
                    const force = (1 - dist / MOUSE_RADIUS) * 0.06;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            if (haloAlpha > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r + 1.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${accentRgb},${haloAlpha})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${accentRgb},${dotAlpha})`;
            ctx.fill();
        }

        // --- Update + draw hero particles (orbiting + breathing + tethered)-
        for (let h = 0; h < heroes.length; h++) {
            const H = heroes[h];

            H.phase += H.omega;
            H.tilt += H.tiltOmega;
            H.breatheT += H.breatheOmega;

            // Orbit point in local space, then rotate by tilt.
            const lx = Math.cos(H.phase) * H.rx;
            const ly = Math.sin(H.phase) * H.ry;
            const cosT = Math.cos(H.tilt);
            const sinT = Math.sin(H.tilt);
            const targetX = H.cx + lx * cosT - ly * sinT;
            const targetY = H.cy + lx * sinT + ly * cosT;

            // Cursor tug — capped so it never escapes its orbit.
            if (mouse.active) {
                const dx = mouse.x - H.x;
                const dy = mouse.y - H.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_RADIUS * 1.1 && dist > 0.001) {
                    const pull = (1 - dist / (MOUSE_RADIUS * 1.1)) * 18;
                    H.ox += (dx / dist) * pull * 0.04;
                    H.oy += (dy / dist) * pull * 0.04;
                }
            }
            // Spring back so it always returns to its orbit (no split).
            H.ox *= 0.86;
            H.oy *= 0.86;
            const maxOff = 26;
            const offLen = Math.hypot(H.ox, H.oy);
            if (offLen > maxOff) {
                H.ox = (H.ox / offLen) * maxOff;
                H.oy = (H.oy / offLen) * maxOff;
            }

            // Ease render position toward orbit target + offset.
            H.x += (targetX + H.ox - H.x) * 0.09;
            H.y += (targetY + H.oy - H.y) * 0.09;

            // Breathing radius (expand/contract).
            const r = H.baseR * (1 + 0.45 * Math.sin(H.breatheT));

            // Soft outer glow.
            const grad = ctx.createRadialGradient(H.x, H.y, 0, H.x, H.y, r * 6);
            grad.addColorStop(0, `rgba(${accentRgb},${heroGlow})`);
            grad.addColorStop(1, `rgba(${accentRgb},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(H.x, H.y, r * 6, 0, Math.PI * 2);
            ctx.fill();

            // Rotating ring around the hero dot.
            const ringR = r * 2.6;
            ctx.save();
            ctx.translate(H.x, H.y);
            ctx.rotate(H.phase * 2);
            ctx.strokeStyle = `rgba(${accentRgb},${(isLight ? 0.55 : 0.42).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Dashed-like arc via two short strokes for a "rotor" feel.
            ctx.arc(0, 0, ringR, 0, Math.PI * 0.7);
            ctx.moveTo(Math.cos(Math.PI) * ringR, Math.sin(Math.PI) * ringR);
            ctx.arc(0, 0, ringR, Math.PI, Math.PI * 1.7);
            ctx.stroke();
            ctx.restore();

            // Core dot.
            ctx.beginPath();
            ctx.arc(H.x, H.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${accentRgb},${Math.min(1, dotAlpha + 0.1)})`;
            ctx.fill();
        }

        // --- Linking lines (regular <-> regular) ---------------------------
        // Squared-distance early-out avoids a sqrt per pair (~6k pairs/frame
        // on desktop). sqrt is only paid for pairs that actually draw.
        const linkDistSq = LINK_DIST * LINK_DIST;
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < linkDistSq) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / LINK_DIST) * lineBase;
                    ctx.strokeStyle = `rgba(${accentRgb},${alpha.toFixed(3)})`;
                    ctx.lineWidth = isLight ? 1.2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        // --- Linking lines (hero -> regular) with extended reach ----------
        const heroReach = LINK_DIST * HERO_LINK_BOOST;
        const heroReachSq = heroReach * heroReach;
        for (let h = 0; h < heroes.length; h++) {
            const H = heroes[h];
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = H.x - p.x;
                const dy = H.y - p.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < heroReachSq) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / heroReach) * (lineBase + 0.15);
                    ctx.strokeStyle = `rgba(${accentRgb},${alpha.toFixed(3)})`;
                    ctx.lineWidth = isLight ? 1.3 : 1.1;
                    ctx.beginPath();
                    ctx.moveTo(H.x, H.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            }
            // Hero <-> hero spine links — always-on faint backbone.
            for (let k = h + 1; k < heroes.length; k++) {
                const H2 = heroes[k];
                const dx = H.x - H2.x;
                const dy = H.y - H2.y;
                const dist = Math.hypot(dx, dy);
                const spineMax = Math.max(width, height);
                const alpha = (1 - Math.min(dist / spineMax, 1)) * (lineBase + 0.05);
                ctx.strokeStyle = `rgba(${accentRgb},${alpha.toFixed(3)})`;
                ctx.lineWidth = isLight ? 1 : 0.9;
                ctx.beginPath();
                ctx.moveTo(H.x, H.y);
                ctx.lineTo(H2.x, H2.y);
                ctx.stroke();
            }
        }

        rafId = requestAnimationFrame(step);
    };

    const start = () => {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(step);
    };

    const stop = () => {
        running = false;
        cancelAnimationFrame(rafId);
    };

    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) start();
                    else stop();
                }
            },
            { threshold: 0 }
        );
        io.observe(hero);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (hero && hero.getBoundingClientRect().bottom > 0) start();
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
    });

    const themeObserver = new MutationObserver(() => {
        accentRgb = hexToRgb(getAccent());
        isLight = document.body.classList.contains('light-theme');
    });
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });

    let resizeTimer = 0;
    const handleViewportChange = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const wasTouch = isTouch;
            applyProfile();
            resize();
            // Reseed only when the profile flipped or counts feel off,
            // otherwise just keep the existing simulation alive.
            if (wasTouch !== isTouch || particles.length !== COUNT) {
                seed();
            }
        }, 150);
    };
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    // Listen on the actual media queries so DevTools device-mode flips fire
    // even when the window width itself doesn't change (e.g. pointer: coarse).
    if (window.matchMedia) {
        const mqWidth = window.matchMedia('(max-width: 768px)');
        const mqPointer = window.matchMedia('(pointer: coarse)');
        const onMq = () => handleViewportChange();
        if (mqWidth.addEventListener) {
            mqWidth.addEventListener('change', onMq);
            mqPointer.addEventListener('change', onMq);
        } else if (mqWidth.addListener) {
            mqWidth.addListener(onMq);
            mqPointer.addListener(onMq);
        }
    }

    resize();
    seed();
    start();
})();
