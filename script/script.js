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
            strings: ["Full-Stack Developer", "Prompt Engineer", "Java Specialist", "React Enthusiast", "Problem Solver"],
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
    const navHeight = header ? header.offsetHeight : 70; // Fallback if header not found yet

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.offsetTop - navHeight + 1; // +1 for pixel precision

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
        const scrollPosition = window.scrollY + navHeight + 100;
        
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
    // Theme Toggle Functionality
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme on load
    if (currentTheme) {
        body.classList.add(currentTheme); // Assumes 'light-theme' is the class for light mode
        // If your default is dark, you only need to add 'light-theme' class
        // If 'dark-theme' is a class, then:
        // if (currentTheme === 'light-theme') body.classList.add('light-theme');
        // else body.classList.add('dark-theme'); // or remove 'light-theme'
    } else {
        // Optional: Check system preference if no theme is saved
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // if (!prefersDark) { // If system prefers light AND no saved theme
        //     body.classList.add('light-theme');
        // }
        // For now, default is dark as per CSS unless 'light-theme' is added.
    }


    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            body.classList.toggle('light-theme');

            // Save preference to localStorage
            if (body.classList.contains('light-theme')) {
                localStorage.setItem('theme', 'light-theme');
            } else {
                localStorage.removeItem('theme'); // Or set localStorage.setItem('theme', 'dark-theme');
                // if you have a specific .dark-theme class
            }
        });
    }

    // Dynamic Year for Footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Enhanced Scroll Reveal Animation with Staggered Effect
    const revealElements = document.querySelectorAll('.timeline-item, .project-card, .about-text, .contact-link');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for multiple elements
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('revealed');
                }, index * 100); // Stagger by 100ms
                
                // Unobserve after revealing for performance
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
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

    // Lazy loading for images (if any are added in future)
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // Performance: Preload critical resources
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = href;
            document.head.appendChild(linkElement);
        }
    });

    // Smooth scroll polyfill for older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        const smoothScrollScript = document.createElement('script');
        smoothScrollScript.src = 'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15/dist/smooth-scroll.polyfills.min.js';
        document.body.appendChild(smoothScrollScript);
    }

});