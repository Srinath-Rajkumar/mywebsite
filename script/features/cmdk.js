/**
 * Command palette (Cmd/Ctrl+K).
 * Tiny self-contained fuzzy matcher, keyboard nav, focus trap, ARIA dialog.
 */
(function initCmdK() {
    const root = document.getElementById('sr-cmdk');
    const input = document.getElementById('sr-cmdk-input');
    const list = document.getElementById('sr-cmdk-list');
    const empty = document.getElementById('sr-cmdk-empty');
    const hintChip = document.getElementById('sr-cmdk-hint');
    if (!root || !input || !list) return;

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const headerH =
            document.getElementById('header')?.offsetHeight || 70;
        window.scrollTo({
            top: el.offsetTop - headerH + 1,
            behavior: 'smooth',
        });
    };

    const commands = [
        { id: 'go-home', label: 'Go to Home', hint: 'Section', icon: 'home-outline', keywords: 'home hero top start', run: () => scrollToSection('hero') },
        { id: 'go-about', label: 'Go to About', hint: 'Section', icon: 'person-outline', keywords: 'about me bio profile', run: () => scrollToSection('about') },
        { id: 'go-experience', label: 'Go to Experience', hint: 'Section', icon: 'briefcase-outline', keywords: 'experience work jobs timeline career', run: () => scrollToSection('experience') },
        { id: 'go-contact', label: 'Go to Contact', hint: 'Section', icon: 'mail-outline', keywords: 'contact reach email hire', run: () => scrollToSection('contact') },
        {
            id: 'toggle-theme',
            label: 'Toggle theme',
            hint: 'Appearance',
            icon: 'contrast-outline',
            keywords: 'theme dark light mode color',
            run: () => document.getElementById('theme-toggle')?.click(),
        },
        {
            id: 'copy-email',
            label: 'Copy email address',
            hint: 'developer@srinath.cloud',
            icon: 'copy-outline',
            keywords: 'email copy mail address developer',
            run: async () => {
                try {
                    await navigator.clipboard.writeText('developer@srinath.cloud');
                    flash('Email copied to clipboard');
                } catch {
                    window.location.href = 'mailto:developer@srinath.cloud';
                }
            },
        },
        {
            id: 'open-email',
            label: 'Send email',
            hint: 'mailto:',
            icon: 'mail-open-outline',
            keywords: 'email mail send contact',
            run: () => (window.location.href = 'mailto:developer@srinath.cloud'),
        },
        {
            id: 'open-github',
            label: 'Open GitHub profile',
            hint: 'github.com/Srinath-Rajkumar',
            icon: 'logo-github',
            keywords: 'github code repo profile',
            run: () => window.open('https://github.com/Srinath-Rajkumar', '_blank', 'noopener'),
        },
        {
            id: 'open-linkedin',
            label: 'Open LinkedIn profile',
            hint: 'linkedin.com/in/srinathrajkumar07',
            icon: 'logo-linkedin',
            keywords: 'linkedin profile connect social',
            run: () => window.open('https://www.linkedin.com/in/srinathrajkumar07/', '_blank', 'noopener'),
        },
    ];

    // Tiny subsequence fuzzy matcher: every char of query must appear in
    // order in the candidate. Returns a score (lower = better) or -1.
    const score = (query, text) => {
        if (!query) return 0;
        const q = query.toLowerCase();
        const t = text.toLowerCase();
        let qi = 0;
        let lastIdx = -1;
        let total = 0;
        for (let ti = 0; ti < t.length && qi < q.length; ti++) {
            if (t[ti] === q[qi]) {
                if (lastIdx >= 0) total += ti - lastIdx;
                lastIdx = ti;
                qi++;
            }
        }
        if (qi < q.length) return -1;
        return total + (t.length - q.length);
    };

    let filtered = commands.slice();
    let activeIdx = 0;
    let lastFocused = null;

    const render = () => {
        list.innerHTML = '';
        if (!filtered.length) {
            empty.hidden = false;
            list.hidden = true;
            return;
        }
        empty.hidden = true;
        list.hidden = false;

        filtered.forEach((cmd, i) => {
            const li = document.createElement('li');
            li.className = 'sr-cmdk__item';
            li.setAttribute('role', 'option');
            li.id = `sr-cmdk-opt-${cmd.id}`;
            li.dataset.idx = String(i);
            if (i === activeIdx) {
                li.setAttribute('aria-selected', 'true');
                li.classList.add('is-active');
            }
            // Build children explicitly so user-visible strings (label/hint)
            // are inserted as text nodes, not parsed as HTML. The icon name
            // is a controlled enum and stays as an attribute.
            const iconWrap = document.createElement('span');
            iconWrap.className = 'sr-cmdk__icon';
            const ionIcon = document.createElement('ion-icon');
            ionIcon.setAttribute('name', cmd.icon);
            ionIcon.setAttribute('aria-hidden', 'true');
            iconWrap.appendChild(ionIcon);

            const labelEl = document.createElement('span');
            labelEl.className = 'sr-cmdk__label';
            labelEl.textContent = cmd.label;

            const hintEl = document.createElement('span');
            hintEl.className = 'sr-cmdk__hint';
            hintEl.textContent = cmd.hint || '';

            li.append(iconWrap, labelEl, hintEl);
            li.addEventListener('mousemove', () => {
                if (activeIdx !== i) {
                    activeIdx = i;
                    syncActive();
                }
            });
            li.addEventListener('click', () => execute(i));
            list.appendChild(li);
        });

        input.setAttribute(
            'aria-activedescendant',
            `sr-cmdk-opt-${filtered[activeIdx].id}`
        );
    };

    const syncActive = () => {
        const items = list.querySelectorAll('.sr-cmdk__item');
        items.forEach((el, i) => {
            const on = i === activeIdx;
            el.classList.toggle('is-active', on);
            if (on) {
                el.setAttribute('aria-selected', 'true');
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.removeAttribute('aria-selected');
            }
        });
        if (filtered[activeIdx]) {
            input.setAttribute(
                'aria-activedescendant',
                `sr-cmdk-opt-${filtered[activeIdx].id}`
            );
        }
    };

    const applyFilter = () => {
        const q = input.value.trim();
        if (!q) {
            filtered = commands.slice();
        } else {
            filtered = commands
                .map((cmd) => {
                    const haystack = `${cmd.label} ${cmd.keywords || ''} ${cmd.hint || ''}`;
                    const s = score(q, haystack);
                    return { cmd, s };
                })
                .filter((r) => r.s >= 0)
                .sort((a, b) => a.s - b.s)
                .map((r) => r.cmd);
        }
        activeIdx = 0;
        render();
    };

    const open = () => {
        lastFocused = document.activeElement;
        root.hidden = false;
        root.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        input.value = '';
        applyFilter();
        // Focus after the modal becomes visible.
        requestAnimationFrame(() => input.focus());
        hideHint();
    };

    const close = () => {
        root.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(() => {
            root.hidden = true;
        }, 180);
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    };

    const execute = (i) => {
        const cmd = filtered[i];
        if (!cmd) return;
        close();
        // Defer so close() animations don't fight the run side-effects.
        setTimeout(() => cmd.run(), 60);
    };

    const flash = (msg) => {
        const t = document.createElement('div');
        t.className = 'sr-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('is-visible'));
        setTimeout(() => {
            t.classList.remove('is-visible');
            setTimeout(() => t.remove(), 300);
        }, 1800);
    };

    // Global hotkey.
    document.addEventListener('keydown', (e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (mod && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (root.classList.contains('is-open')) close();
            else open();
            return;
        }
        if (!root.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filtered.length) {
                activeIdx = (activeIdx + 1) % filtered.length;
                syncActive();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (filtered.length) {
                activeIdx = (activeIdx - 1 + filtered.length) % filtered.length;
                syncActive();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            execute(activeIdx);
        } else if (e.key === 'Tab') {
            // Trap focus inside input only (single focusable in dialog).
            e.preventDefault();
        }
    });

    input.addEventListener('input', applyFilter);

    // Backdrop click closes.
    root.addEventListener('click', (e) => {
        if (e.target === root) close();
    });

    // Hint chip.
    const hideHint = () => {
        if (!hintChip) return;
        hintChip.classList.add('is-hidden');
        setTimeout(() => hintChip.remove(), 400);
    };
    if (hintChip) {
        // Hide on touch; only useful for keyboard users.
        if (window.SR && window.SR.isTouch) {
            hintChip.remove();
        } else {
            setTimeout(hideHint, 6500);
            hintChip.addEventListener('click', open);
        }
    }

    // Public open for nav links if ever needed.
    window.SR = window.SR || {};
    window.SR.openCmdK = open;
})();
