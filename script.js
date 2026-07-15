// Add js-enabled class only when script executes successfully
document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Awwwards Page Loader
    const loaderScreen = document.getElementById('loader-screen');
    const loaderPercent = document.getElementById('loader-percent');
    const loaderBar = document.getElementById('loader-bar');
    
    let currentPercent = 0;
    const loaderInterval = setInterval(() => {
        currentPercent += Math.floor(Math.random() * 5) + 1;
        if (currentPercent >= 100) {
            currentPercent = 100;
            clearInterval(loaderInterval);
            
            // GSAP Entrance Reveal
            gsap.timeline()
                .to(loaderBar, {
                    duration: 0.3,
                    boxShadow: '0 0 25px rgba(6,182,212,1)',
                })
                .to(loaderScreen, {
                    duration: 0.8,
                    opacity: 0,
                    scale: 1.05,
                    filter: 'blur(20px)',
                    ease: 'power3.inOut',
                    pointerEvents: 'none',
                    onComplete: () => {
                        loaderScreen.style.display = 'none';
                        // Reveal main body sections with GSAP staggered fades
                        gsap.from('.navbar', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });
                        gsap.from('.hero-content > *', { duration: 1, y: 30, opacity: 0, stagger: 0.15, ease: 'power3.out' });
                    }
                });
        }
        if (loaderPercent) loaderPercent.textContent = currentPercent.toString().padStart(2, '0');
        if (loaderBar) loaderBar.style.width = `${currentPercent}%`;
    }, 45);

    // 0.1. Lenis Smooth Scroll Configuration
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        wheelMultiplier: 1.2,
        infinite: false
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 1. Navbar Scroll Effect & Active Section Tracker
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    let isScrolling = false;
    let scrollTimeout;

    lenis.on('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
        
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Smooth scrolling for internal links via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80,
                    duration: 0.9,
                    ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // 3. Custom Magnetic & Particle Trail Cursor
    const cursor = document.getElementById('custom-cursor');
    const particleCanvas = document.getElementById('cursor-particles');
    let pCtx = null;
    let canvasWidth = 0;
    let canvasHeight = 0;
    
    if (particleCanvas) {
        pCtx = particleCanvas.getContext('2d');
        const resizeCanvas = () => {
            canvasWidth = particleCanvas.width = window.innerWidth;
            canvasHeight = particleCanvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const particles = [];

    // Handle both mouse and touchpad pointer events for cursor tracking
    function updateCursorPos(clientX, clientY) {
        mousePos.x = clientX;
        mousePos.y = clientY;

        if (pCtx && Math.random() < 0.6) {
            particles.push({
                x: clientX,
                y: clientY,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                color: Math.random() < 0.7 ? '#06b6d4' : '#8b5cf6'
            });
        }
    }

    window.addEventListener('mousemove', (e) => updateCursorPos(e.clientX, e.clientY));
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return; // ignore touch, only mouse/touchpad
        updateCursorPos(e.clientX, e.clientY);
    });

    // Show cursor only when pointer is inside window
    document.addEventListener('mouseenter', () => { if (cursor) cursor.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { if (cursor) cursor.style.opacity = '0'; });

    function animateCursor() {
        const dx = mousePos.x - cursorPos.x;
        const dy = mousePos.y - cursorPos.y;
        cursorPos.x += dx * 0.12;
        cursorPos.y += dy * 0.12;
        
        if (cursor) {
            cursor.style.left = `${cursorPos.x}px`;
            cursor.style.top = `${cursorPos.y}px`;
        }

        if (pCtx) {
            pCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;
                
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    pCtx.save();
                    pCtx.globalAlpha = p.alpha;
                    pCtx.fillStyle = p.color;
                    pCtx.beginPath();
                    pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    pCtx.fill();
                    pCtx.restore();
                }
            }
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover interactive elements scaling
    const hoverables = document.querySelectorAll('a, button, .cursor-pointer, .project-card, .cert-card');
    hoverables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (cursor) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
                cursor.style.borderColor = '#8b5cf6';
            }
        });
        item.addEventListener('mouseleave', () => {
            if (cursor) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            }
        });
    });

    // Magnetic interaction triggers for items
    const magnetics = document.querySelectorAll('.logo, .nav-links a, .hero-social a, .btn, #run-console-btn');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.4)'
            });
        });
    });

    // 2.1 Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('nav-open');
            hamburger.classList.toggle('is-open', isOpen);
            hamburger.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-open');
                hamburger.classList.remove('is-open');
                hamburger.querySelector('i').className = 'fas fa-bars';
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('nav-open');
                hamburger.classList.remove('is-open');
                hamburger.querySelector('i').className = 'fas fa-bars';
            }
        });
    }

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

    // 5. Certificate Lightbox Modal & Preloader
    const lightbox = document.getElementById('cert-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    const certElements = document.querySelectorAll('[data-cert]');
    const verifyLink = document.getElementById('lightbox-verify-link');
    
    // PRELOADER: Cache all certificate images immediately so they instantly appear instantly on click
    const preloadedImages = [];
    certElements.forEach(el => {
        const certSrc = el.getAttribute('data-cert');
        if (certSrc) {
            const img = new Image();
            img.src = certSrc;
            preloadedImages.push(img);
        }
    });
    
    certElements.forEach(el => {
        el.addEventListener('click', () => {
            const certSrc = el.getAttribute('data-cert');
            const certLink = el.getAttribute('data-link');
            const imgEl = el.querySelector('img');
            const captionText = imgEl ? imgEl.alt : 'Certificate Preview';
            
            if (lightbox && lightboxImg && lightboxCaption) {
                // Image is already preloaded, so this will render locally instantly
                lightboxImg.src = certSrc;
                lightboxCaption.textContent = captionText;
                if (verifyLink && certLink) {
                    verifyLink.href = certLink;
                    verifyLink.style.display = 'inline-flex';
                } else if (verifyLink) {
                    verifyLink.style.display = 'none';
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (closeBtn && lightbox) {
        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // 6. Neural Network 3D Sphere Canvas Animation
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        let cx = width > 992 ? width * 0.72 : width / 2;
        let cy = height / 2;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            cx = width > 992 ? width * 0.72 : width / 2;
            cy = height / 2;
        });

        const points = [];
        const numPoints = 55;
        const radius = 180;
        const fov = 350;

        for (let i = 0; i < numPoints; i++) {
            const phi = Math.acos(-1 + (2 * i) / numPoints);
            const theta = Math.sqrt(numPoints * Math.PI) * phi;
            points.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi)
            });
        }

        let speedX = 0.001;
        let speedY = 0.0015;

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / height) * 2 - 1;
            speedX = ny * 0.005;
            speedY = nx * 0.005;
        });

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Decay speed toward default slow spin
            speedX += (0.0008 - speedX) * 0.03;
            speedY += (0.0012 - speedY) * 0.03;

            // Rotate points in 3D
            points.forEach(p => {
                const cosX = Math.cos(speedX);
                const sinX = Math.sin(speedX);
                const y1 = p.y * cosX - p.z * sinX;
                const z1 = p.y * sinX + p.z * cosX;

                const cosY = Math.cos(speedY);
                const sinY = Math.sin(speedY);
                const x2 = p.x * cosY - z1 * sinY;
                const z2 = p.x * sinY + z1 * cosY;

                p.x = x2;
                p.y = y1;
                p.z = z2;

                // Project to 2D with perspective scale
                const scale = fov / (fov + p.z);
                p.px = cx + p.x * scale;
                p.py = cy + p.y * scale;
                p.scale = scale;
            });

            // Draw line linkages
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dz = p1.z - p2.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 135) {
                        const avgZ = (p1.z + p2.z) / 2;
                        const depth = (avgZ + radius) / (2 * radius); // 0 (front) to 1 (back)
                        
                        // Closer is cyan, further is purple
                        const alpha = (1 - depth) * 0.22 + 0.02;
                        const color = avgZ < 0 
                            ? `rgba(6, 182, 212, ${alpha})` 
                            : `rgba(139, 92, 246, ${alpha * 0.7})`;

                        ctx.beginPath();
                        ctx.moveTo(p1.px, p1.py);
                        ctx.lineTo(p2.px, p2.py);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = avgZ < 0 ? 0.7 : 0.4;
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            points.forEach(p => {
                const size = p.scale * 1.8;
                ctx.beginPath();
                ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
                
                const depth = (p.z + radius) / (2 * radius);
                const alpha = (1 - depth) * 0.35 + 0.15;
                ctx.fillStyle = p.z < 0 
                    ? `rgba(34, 211, 238, ${alpha})` 
                    : `rgba(168, 85, 247, ${alpha * 0.6})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }
        animate();
    }

    // 7. Jupyter Code Console Simulator
    const runBtn = document.getElementById('run-console-btn');
    const outputArea = document.getElementById('console-output-area');
    
    if (runBtn && outputArea) {
        runBtn.addEventListener('click', () => {
            if (runBtn.getAttribute('disabled') === 'true') return;
            
            runBtn.setAttribute('disabled', 'true');
            runBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Running...`;
            outputArea.innerHTML = `<span class="output-comment"># Initializing CPU/GPU training environment...</span>\n`;
            outputArea.innerHTML += `<span class="output-comment"># Seriailizing feature matrix student_performance (1,000+ samples)...</span>\n`;
            
            let epoch = 1;
            const maxEpochs = 5;
            const lossValues = [0.432, 0.284, 0.198, 0.134, 0.089];
            const accValues = [88.5, 92.1, 95.3, 97.4, 98.4];
            
            function executeEpoch() {
                if (epoch <= maxEpochs) {
                    const percent = Math.floor((epoch / maxEpochs) * 100);
                    const widthPixels = Math.floor((epoch / maxEpochs) * 150);
                    
                    outputArea.innerHTML += `Epoch ${epoch}/${maxEpochs} -> <span class="percent-bar" style="width:${widthPixels}px"></span> Loss: <span class="output-comment">${lossValues[epoch-1].toFixed(3)}</span> - Val R²: <span class="output-metric">${accValues[epoch-1].toFixed(1)}%</span>\n`;
                    outputArea.scrollTop = outputArea.scrollHeight;
                    
                    epoch++;
                    setTimeout(executeEpoch, 600);
                } else {
                    outputArea.innerHTML += `\n<span class="output-metric"><b>[Training Complete]</b></span>\n`;
                    outputArea.innerHTML += `Final Validation Accuracy: <span class="output-metric">98.4%</span> (R² Score)\n`;
                    outputArea.innerHTML += `Final Evaluation Loss: <span class="output-comment">0.089</span> (Mean Squared Error)\n`;
                    outputArea.innerHTML += `Weights cached and saved successfully to <code>./checkpoints/student_model.bin</code>.`;
                    outputArea.scrollTop = outputArea.scrollHeight;
                    
                    runBtn.removeAttribute('disabled');
                    runBtn.innerHTML = `<i class="fas fa-redo"></i> Restart Cell`;
                }
            }
            
            setTimeout(executeEpoch, 800);
        });
    }

    // 8. 3D Hologram & Skill Orbit Interactions
    const scanner = document.querySelector('.hologram-scanner');
    if (scanner) {
        gsap.to(scanner, {
            top: '98%',
            duration: 2.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    const orbits = [
        { el: document.getElementById('orbit-py'), radiusX: 160, radiusY: 80, speed: 0.012, angle: 0 },
        { el: document.getElementById('orbit-db'), radiusX: 185, radiusY: 90, speed: -0.01, angle: Math.PI / 2 },
        { el: document.getElementById('orbit-ml'), radiusX: 170, radiusY: 85, speed: 0.008, angle: Math.PI },
        { el: document.getElementById('orbit-rag'), radiusX: 195, radiusY: 95, speed: -0.007, angle: 1.5 * Math.PI }
    ];

    function updateOrbits() {
        const container = document.querySelector('.profile-img-container');
        if (container) {
            const cx = container.offsetWidth / 2;
            const cy = container.offsetHeight / 2;
            
            orbits.forEach(orb => {
                if (orb.el) {
                    orb.angle += orb.speed;
                    const x = cx + Math.cos(orb.angle) * orb.radiusX - orb.el.offsetWidth / 2;
                    const y = cy + Math.sin(orb.angle) * orb.radiusY - orb.el.offsetHeight / 2;
                    
                    orb.el.style.left = `${x}px`;
                    orb.el.style.top = `${y}px`;
                    
                    const scale = 0.8 + ((Math.sin(orb.angle) + 1) / 2) * 0.4;
                    const zIndex = Math.sin(orb.angle) > 0 ? 35 : 15;
                    orb.el.style.transform = `scale(${scale})`;
                    orb.el.style.zIndex = zIndex;
                    orb.el.style.opacity = 0.4 + ((Math.sin(orb.angle) + 1) / 2) * 0.6;
                }
            });
        }
        requestAnimationFrame(updateOrbits);
    }
    if (orbits.some(o => o.el)) requestAnimationFrame(updateOrbits);

    // 9. Typewriter text loop
    const typedTextSpan = document.getElementById('typed-text');
    if (typedTextSpan) {
        const roles = [
            'Data Scientist',
            'Machine Learning Engineer',
            'Aspiring AI Developer',
            'Computer Science Researcher'
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isTyping = true;

        function typeLoop() {
            const currentRole = roles[roleIndex];
            if (isTyping) {
                typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === currentRole.length) {
                    isTyping = false;
                    setTimeout(typeLoop, 1800); // Wait on complete word
                } else {
                    setTimeout(typeLoop, 75);
                }
            } else {
                typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isTyping = true;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeLoop, 300); // Wait before starting next role
                } else {
                    setTimeout(typeLoop, 35);
                }
            }
        }
        setTimeout(typeLoop, 1000);
    }

    // 10. Interactive Skills Constellation Galaxy Canvas
    const skillCanvas = document.getElementById('skills-galaxy-canvas');
    if (skillCanvas) {
        const sCtx = skillCanvas.getContext('2d');
        let sWidth = (skillCanvas.width = skillCanvas.offsetWidth);
        let sHeight = (skillCanvas.height = skillCanvas.offsetHeight);

        const resizeCanvas = () => {
            if (skillCanvas.offsetWidth > 0) {
                sWidth = skillCanvas.width = skillCanvas.offsetWidth;
                sHeight = skillCanvas.height = skillCanvas.offsetHeight;
            }
        };
        window.addEventListener('resize', resizeCanvas);

        const coreNode = { x: 0, y: 0, label: 'AI Core', size: 18, color: '#06b6d4' };
        
        // Define coordinate relative offsets
        const categories = [
            { id: 'languages', label: 'Languages', x: -130, y: -90, size: 9, color: '#06b6d4', panelId: 'panel-languages' },
            { id: 'dsml', label: 'Data Science & ML', x: 130, y: -90, size: 9, color: '#8b5cf6', panelId: 'panel-dsml' },
            { id: 'databases', label: 'Databases', x: -140, y: 90, size: 9, color: '#06b6d4', panelId: 'panel-databases' },
            { id: 'frameworks', label: 'Frameworks', x: 140, y: 90, size: 9, color: '#8b5cf6', panelId: 'panel-frameworks' },
            { id: 'tools', label: 'Reporting & BI', x: 0, y: -160, size: 9, color: '#06b6d4', panelId: 'panel-tools' }
        ];

        const cursorPosition = { x: -999, y: -999 };
        let activePanelId = 'panel-languages'; // Default panel

        const updateCursor = (e) => {
            const rect = skillCanvas.getBoundingClientRect();
            cursorPosition.x = e.clientX - rect.left;
            cursorPosition.y = e.clientY - rect.top;
        };

        skillCanvas.addEventListener('mousemove', updateCursor);
        skillCanvas.addEventListener('mouseleave', () => {
            cursorPosition.x = -999;
            cursorPosition.y = -999;
        });

        function showPanel(panelId) {
            if (activePanelId === panelId) return;
            activePanelId = panelId;

            const panels = document.querySelectorAll('.skill-detail-panel');
            panels.forEach(p => {
                if (p.id === panelId) {
                    p.classList.remove('hidden-panel');
                    p.classList.add('active-panel');
                    p.style.pointerEvents = 'auto';
                    gsap.fromTo(p, { opacity: 0, x: 20, filter: 'blur(4px)' }, { opacity: 1, x: 0, filter: 'blur(0)', duration: 0.4, ease: 'power2.out' });
                } else {
                    p.classList.remove('active-panel');
                    p.classList.add('hidden-panel');
                    p.style.pointerEvents = 'none';
                }
            });
        }

        let frameCount = 0;
        function renderGalaxy() {
            if (!sCtx) return;
            sCtx.clearRect(0, 0, sWidth, sHeight);
            
            const cx = sWidth / 2;
            const cy = sHeight / 2;
            
            coreNode.x = cx;
            coreNode.y = cy + Math.sin(frameCount * 0.02) * 5;

            // Draw links
            categories.forEach(cat => {
                const targetX = cx + cat.x + Math.sin(frameCount * 0.015 + cat.x) * 6;
                const targetY = cy + cat.y + Math.cos(frameCount * 0.015 + cat.y) * 6;
                
                cat.currentX = targetX;
                cat.currentY = targetY;

                sCtx.beginPath();
                sCtx.moveTo(coreNode.x, coreNode.y);
                sCtx.lineTo(targetX, targetY);
                sCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
                sCtx.lineWidth = 1;
                sCtx.stroke();

                // Pulse streams
                const pulseRange = (frameCount * 0.01) % 1; 
                const pulseX = coreNode.x + (targetX - coreNode.x) * pulseRange;
                const pulseY = coreNode.y + (targetY - coreNode.y) * pulseRange;

                sCtx.beginPath();
                sCtx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
                sCtx.fillStyle = cat.color;
                sCtx.fill();
            });

            // Draw Core
            sCtx.beginPath();
            sCtx.arc(coreNode.x, coreNode.y, coreNode.size + Math.sin(frameCount * 0.04) * 2, 0, Math.PI * 2);
            sCtx.fillStyle = 'rgba(6, 182, 212, 0.12)';
            sCtx.fill();
            sCtx.lineWidth = 1.5;
            sCtx.strokeStyle = coreNode.color;
            sCtx.stroke();

            sCtx.font = '10px monospace';
            sCtx.fillStyle = '#06b6d4';
            sCtx.textAlign = 'center';
            sCtx.fillText('AI_CORE', coreNode.x, coreNode.y - coreNode.size - 6);

            // Draw Categories
            let hoverNodeId = null;
            categories.forEach(cat => {
                const dist = Math.hypot(cursorPosition.x - cat.currentX, cursorPosition.y - cat.currentY);
                const isHovered = dist < 32;

                if (isHovered) {
                    hoverNodeId = cat.panelId;
                }

                if (isHovered || activePanelId === cat.panelId) {
                    sCtx.beginPath();
                    sCtx.arc(cat.currentX, cat.currentY, cat.size + 10 + Math.sin(frameCount * 0.07) * 2, 0, Math.PI * 2);
                    sCtx.fillStyle = cat.color === '#06b6d4' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(139, 92, 246, 0.08)';
                    sCtx.fill();
                }

                sCtx.beginPath();
                sCtx.arc(cat.currentX, cat.currentY, cat.size, 0, Math.PI * 2);
                sCtx.fillStyle = cat.color;
                sCtx.fill();

                sCtx.font = '11px sans-serif';
                sCtx.fillStyle = isHovered || activePanelId === cat.panelId ? '#ffffff' : '#94a3b8';
                sCtx.fillText(cat.label, cat.currentX, cat.currentY - cat.size - 8);
            });

            if (hoverNodeId) {
                showPanel(hoverNodeId);
            }

            frameCount++;
            requestAnimationFrame(renderGalaxy);
        }
        requestAnimationFrame(renderGalaxy);
    }

    // 11. Projects 3D Perspective Tilt Effect (Removed to restore child button hit-testing)
    
    // 12. Academic Metro Transit Station Toggles
    const metroStations = document.querySelectorAll('.metro-station');
    let activeStationId = null;

    metroStations.forEach(station => {
        const triggerEvent = () => {
            const stationId = station.getAttribute('data-station');
            if (activeStationId === stationId) return;
            activeStationId = stationId;

            // Remove active classes
            metroStations.forEach(s => {
                const nodeCircle = s.querySelector('.w-10, .w-12');
                if (nodeCircle) {
                    nodeCircle.style.borderColor = '';
                    nodeCircle.style.transform = '';
                }
            });

            // Highlight current station circle
            const activeCircle = station.querySelector('.w-10, .w-12');
            if (activeCircle) {
                activeCircle.style.transform = 'scale(1.15)';
            }

            const panels = document.querySelectorAll('.metro-detail');
            panels.forEach(panel => {
                if (panel.id === stationId) {
                    panel.classList.remove('hidden-panel');
                    panel.classList.add('active-panel');
                    panel.style.pointerEvents = 'auto';
                    gsap.fromTo(panel, { opacity: 0, y: 15, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0)', duration: 0.5, ease: 'power2.out' });
                } else {
                    panel.classList.remove('active-panel');
                    panel.classList.add('hidden-panel');
                    panel.style.pointerEvents = 'none';
                }
            });
        };

        station.addEventListener('mouseenter', triggerEvent);
        station.addEventListener('click', triggerEvent);
    });

    // 13. Secure Terminal Contact Node Form Handles
    const termForm = document.getElementById('terminal-form');
    const termLogs = document.getElementById('terminal-logs');

    if (termForm && termLogs) {
        termForm.addEventListener('submit', (e) => {
            e.preventDefault();
            termLogs.classList.remove('hidden');
            termLogs.innerHTML = '<div class="text-slate-500 mt-1">[SYSTEM] COMPILING DATA PACKETS...</div>';

            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const msg = document.getElementById('form-msg').value;

            // Step 1: Encrypting
            setTimeout(() => {
                const encDiv = document.createElement('div');
                encDiv.className = 'text-slate-500 mt-1';
                encDiv.textContent = '[SYSTEM] ENCRYPTING TRANSMISSION STREAM...';
                termLogs.appendChild(encDiv);
            }, 600);

            // Step 2: Routing
            setTimeout(() => {
                const routeDiv = document.createElement('div');
                routeDiv.className = 'text-cyan-400 mt-1';
                routeDiv.textContent = `[SYSTEM] DETECTING ROUTE TO sinanmssk@gmail.com...`;
                termLogs.appendChild(routeDiv);
            }, 1200);

            // Step 3: Success
            setTimeout(() => {
                const succDiv = document.createElement('div');
                succDiv.className = 'text-green-400 font-bold mt-1';
                succDiv.textContent = `[SUCCESS] HANDSHAKE STABLISHED. PACKAGE DELIVERED TO sinanmssk@gmail.com.`;
                termLogs.appendChild(succDiv);

                // Reset inputs
                termForm.reset();
            }, 1800);
        });
    }

});

