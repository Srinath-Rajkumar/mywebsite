document.addEventListener('DOMContentLoaded', () => {

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
                if (navToggle.classList.contains('active')) {
                    navToggle.click();
                }
            }
        });
    });

    // Update active nav link on scroll
    function updateActiveNavLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 50; // Adjusted offset
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial call

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.nav-links');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.classList.toggle('active'); // For hamburger animation
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

    // Simple Scroll Reveal Animation (Optional - keep it light)
    const revealElements = document.querySelectorAll('.timeline-item, .project-card, .about-content > div');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // observer.unobserve(entry.target); // Optional: unobserve after revealing
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });

});