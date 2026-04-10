/* ============================================
   SR DENTAL ZONE - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       JS PHASE 1: NAVIGATION, HEADER & SMOOTH SCROLL
       ============================================ */

    // ---------- DOM Elements ----------
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // ---------- Sticky Header on Scroll ----------
    const handleScroll = () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);

    // ---------- Hamburger Menu Toggle ----------
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ---------- Active Nav Link on Scroll ----------
    const sections = document.querySelectorAll('section[id]');

    const highlightNavOnScroll = () => {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavOnScroll);

    // ---------- Smooth Scroll for Anchor Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const targetPos = targetEl.offsetTop - headerHeight - 10;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        });
    });


    /* ============================================
       JS PHASE 2: HERO SLIDER
       ============================================ */

    // ---------- Slider DOM Elements ----------
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const heroSection = document.querySelector('.hero');

    let currentSlide = 0;
    let slideInterval = null;
    const SLIDE_DURATION = 5000; // 5 seconds per slide

    // ---------- Go to Specific Slide ----------
    const goToSlide = (index) => {
        // Remove active from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Reset fade-up animations on current slide
        slides[currentSlide].querySelectorAll('.fade-up').forEach(el => {
            el.style.animation = 'none';
            // Force reflow
            void el.offsetHeight;
            el.style.animation = '';
        });

        // Set new active slide
        currentSlide = index;

        // Wrap around
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;

        // Activate new slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };

    // ---------- Next / Previous ----------
    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    // ---------- Auto Play ----------
    const startAutoPlay = () => {
        stopAutoPlay();
        slideInterval = setInterval(nextSlide, SLIDE_DURATION);
    };

    const stopAutoPlay = () => {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    };

    // ---------- Event Listeners ----------
    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoPlay(); // Reset timer after manual navigation
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoPlay();
        });
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoPlay();
        });
    });

    // Pause on hover, resume on leave
    if (heroSection) {
        heroSection.addEventListener('mouseenter', stopAutoPlay);
        heroSection.addEventListener('mouseleave', startAutoPlay);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle when hero is in view
        const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
        if (!heroRect || heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

        if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoPlay();
        }
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (heroSection) {
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchStartX - touchEndX;

            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    nextSlide(); // Swipe left = next
                } else {
                    prevSlide(); // Swipe right = prev
                }
                startAutoPlay();
            }
        }, { passive: true });
    }

    // Initialize slider
    startAutoPlay();


    /* ============================================
       JS PHASE 3: STAT COUNTERS, SCROLL REVEAL & BACK-TO-TOP
       ============================================ */

    // ---------- Animated Stat Counters ----------
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const animateCounters = () => {
        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic for smooth deceleration
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.round(eased * target);

                counter.textContent = currentValue.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Trigger counters when stats bar is in view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // ---------- Scroll Reveal Animations ----------
    const revealElements = document.querySelectorAll(
        '.about-grid, .service-card, .doctor-card, .tech-card, ' +
        '.why-item, .testimonial-card, .appointment-grid, .section-header, ' +
        '.cta-content, .map-info-card'
    );

    // Add fade-in class to all reveal elements
    revealElements.forEach(el => {
        el.classList.add('fade-in');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add stagger delay for grid children
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(
                        child => child.classList.contains('fade-in')
                    );
                    const index = siblings.indexOf(entry.target);
                    if (index > 0) {
                        entry.target.style.transitionDelay = `${index * 0.1}s`;
                    }
                }

                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ---------- Back to Top Button ----------
    const backToTopBtn = document.getElementById('backToTop');

    const toggleBackToTop = () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', toggleBackToTop);

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* ============================================
       JS PHASE 4: TESTIMONIALS SLIDER & FORM HANDLING
       ============================================ */

    // ---------- Testimonials Slider ----------
    const testimonialTrack = document.getElementById('testimonialTrack');
    const testPrev = document.querySelector('.test-prev');
    const testNext = document.querySelector('.test-next');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    let testCurrentIndex = 0;
    let testAutoInterval = null;
    const TEST_AUTO_DURATION = 4000;

    // Calculate how many cards to show based on viewport
    const getTestCardsToShow = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    };

    const getTestMaxIndex = () => {
        const cardsToShow = getTestCardsToShow();
        return Math.max(0, testimonialCards.length - cardsToShow);
    };

    const updateTestSlider = () => {
        if (!testimonialTrack || testimonialCards.length === 0) return;

        const cardWidth = testimonialCards[0].offsetWidth;
        const gap = 28; // matches CSS gap
        const offset = testCurrentIndex * (cardWidth + gap);

        testimonialTrack.style.transform = `translateX(-${offset}px)`;
    };

    const testNextSlide = () => {
        testCurrentIndex++;
        if (testCurrentIndex > getTestMaxIndex()) {
            testCurrentIndex = 0;
        }
        updateTestSlider();
    };

    const testPrevSlide = () => {
        testCurrentIndex--;
        if (testCurrentIndex < 0) {
            testCurrentIndex = getTestMaxIndex();
        }
        updateTestSlider();
    };

    // Auto-play testimonials
    const startTestAutoPlay = () => {
        stopTestAutoPlay();
        testAutoInterval = setInterval(testNextSlide, TEST_AUTO_DURATION);
    };

    const stopTestAutoPlay = () => {
        if (testAutoInterval) {
            clearInterval(testAutoInterval);
            testAutoInterval = null;
        }
    };

    if (testNext) {
        testNext.addEventListener('click', () => {
            testNextSlide();
            startTestAutoPlay();
        });
    }

    if (testPrev) {
        testPrev.addEventListener('click', () => {
            testPrevSlide();
            startTestAutoPlay();
        });
    }

    // Pause on hover
    if (testimonialTrack) {
        const slider = testimonialTrack.closest('.testimonials-slider');
        if (slider) {
            slider.addEventListener('mouseenter', stopTestAutoPlay);
            slider.addEventListener('mouseleave', startTestAutoPlay);
        }
    }

    // Touch swipe for testimonials
    let testTouchStartX = 0;

    if (testimonialTrack) {
        testimonialTrack.addEventListener('touchstart', (e) => {
            testTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        testimonialTrack.addEventListener('touchend', (e) => {
            const swipeDistance = testTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    testNextSlide();
                } else {
                    testPrevSlide();
                }
                startTestAutoPlay();
            }
        }, { passive: true });
    }

    // Recalculate on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Clamp index to new max
            const maxIndex = getTestMaxIndex();
            if (testCurrentIndex > maxIndex) {
                testCurrentIndex = maxIndex;
            }
            updateTestSlider();
        }, 250);
    });

    // Initialize testimonials
    startTestAutoPlay();

    // ---------- Appointment Form Handling ----------
    const appointmentForm = document.getElementById('appointmentForm');

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(appointmentForm);
            const submitBtn = appointmentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            // Simulate form submission (replace with real API call)
            setTimeout(() => {
                // Success state
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Appointment Requested!';
                submitBtn.style.background = '#14b8a6';
                submitBtn.style.borderColor = '#14b8a6';

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success';
                successMsg.innerHTML = `
                    <div style="
                        background: #ecfdf5;
                        border: 1px solid #a7f3d0;
                        border-radius: 8px;
                        padding: 16px 20px;
                        margin-top: 16px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #065f46;
                        font-size: 0.9rem;
                    ">
                        <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.2rem;"></i>
                        <span>Thank you! We will contact you shortly to confirm your appointment.</span>
                    </div>
                `;

                // Remove existing success message if any
                const existing = appointmentForm.querySelector('.form-success');
                if (existing) existing.remove();

                appointmentForm.appendChild(successMsg);

                // Reset form after delay
                setTimeout(() => {
                    appointmentForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';

                    // Fade out success message
                    successMsg.style.transition = 'opacity 0.5s ease';
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.remove(), 500);
                }, 4000);
            }, 1500);
        });

        // ---------- Form Input Focus Effects ----------
        const formInputs = appointmentForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }


}); // end DOMContentLoaded
