document.addEventListener('DOMContentLoaded', () => {

    // Performance: Debounce utility function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Performance: Throttle utility function
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Typed.js Initialization
    if (document.getElementById('typed-text')) {
        new Typed("#typed-text", {
            strings: ["Full-Stack Engineer", "Problem Solver", "Prompt Engineer", "React Enthusiast", "Java Specialist"],
            loop: true,
            typeSpeed: 70,
            backSpeed: 50,
            backDelay: 2000,
            smartBackspace: true
        });
    }

    // Smooth Scrolling & Active Nav Link
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const header = document.getElementById('header');
    // Read header height live — it shrinks via the .scrolled class, so a
    // value captured at DOMContentLoaded would drift by a few px after scroll.
    const getNavHeight = () => (header ? header.offsetHeight : 70);

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.offsetTop - getNavHeight() + 1;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile nav if open
                const navToggle = document.querySelector('.nav-toggle');
                if (navToggle && navToggle.classList.contains('active')) {
                    navToggle.click();
                }
            }
        });
    });

    // Update active nav link on scroll (throttled for performance)
    function updateActiveNavLink() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + getNavHeight() + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === currentSectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Header scroll effect
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Throttled scroll event for better performance
    const throttledScrollHandler = throttle(() => {
        updateActiveNavLink();
        handleHeaderScroll();
    }, 100);

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    updateActiveNavLink(); // Initial call
    handleHeaderScroll(); // Initial call

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.nav-links');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            navToggle.classList.toggle('active'); // For hamburger animation
            navToggle.setAttribute('aria-expanded', isActive);
            
            // Prevent body scroll when menu is open
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && 
                !navToggle.contains(e.target) && 
                !mainNav.contains(e.target)) {
                mainNav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });
    }
    // Theme Toggle — dark is the default; only switch to light when the user
    // has explicitly opted in (persisted in localStorage). System preference
    // is intentionally ignored so the brand-dark look is the first impression.
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light-theme') {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLight ? 'light-theme' : 'dark-theme');
        });
    }

    // Dynamic Year for Footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Auto-update current role duration (e.g. "11 mos", "1 yr 2 mos")
    function formatRoleDuration(totalMonths) {
        if (totalMonths < 12) {
            return `${totalMonths} mos`;
        }
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        const yearLabel = years === 1 ? '1 yr' : `${years} yrs`;
        return months === 0 ? yearLabel : `${yearLabel} ${months} mos`;
    }

    function updateCurrentRoleDuration() {
        const durationEl = document.getElementById('current-role-duration');
        const roleEl = document.querySelector('[data-role-start]');
        if (!durationEl || !roleEl) return;

        const [year, month] = roleEl.dataset.roleStart.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const now = new Date();
        const totalMonths =
            (now.getFullYear() - startDate.getFullYear()) * 12 +
            (now.getMonth() - startDate.getMonth());

        durationEl.textContent = formatRoleDuration(Math.max(1, totalMonths));
    }

    updateCurrentRoleDuration();

    // Enhanced Scroll Reveal Animation with Staggered Effect
    const revealElements = document.querySelectorAll('.timeline-item, .project-card, .about-text, .contact-link');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('revealed');
                    // Hand transform control back to CSS (parallax) after reveal.
                    setTimeout(() => {
                        entry.target.style.transform = '';
                        entry.target.style.transition = 'opacity 0.6s ease-out';
                    }, 700);
                }, index * 100);

                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });

    // Page Load Animation Sequence
    function initPageLoadAnimation() {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                heroContent.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Initialize page load animation
    initPageLoadAnimation();

    // Smooth scroll polyfill for older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        const smoothScrollScript = document.createElement('script');
        smoothScrollScript.src = 'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15/dist/smooth-scroll.polyfills.min.js';
        document.body.appendChild(smoothScrollScript);
    }

});