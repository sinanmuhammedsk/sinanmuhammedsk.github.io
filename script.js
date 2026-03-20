// Add js-enabled class only when script executes successfully
document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Active Menu Status based on Scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 3. Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust position for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Scroll Animations (Intersection Observer)
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    // Observe fade-in elements
    document.querySelectorAll('.fade-in, .fade-in-right').forEach(el => {
        appearOnScroll.observe(el);
    });

    // Observe staggered grid items
    const staggerContainers = [
        document.querySelector('.skills-grid'),
        document.querySelector('.projects-grid'),
        document.querySelector('.timeline'),
        document.querySelector('.certs-grid'),
        document.querySelector('.education-timeline')
    ];

    staggerContainers.forEach(container => {
        if (!container) return;
        
        const items = container.querySelectorAll('.stagger-card');
        
        const staggerObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger the animation of children based on their index
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('appear');
                        }, index * 100); // 100ms delay between each item
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);

        staggerObserver.observe(container);
    });

});
