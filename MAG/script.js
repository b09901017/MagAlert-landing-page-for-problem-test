// ================================
// DOM Content Loaded
// ================================
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initScrollAnimations();
    initDetailsToggle();
    initFormHandler();
    initSmoothScroll();
    initFeatureAnimations();
});

// ================================
// Scroll Progress Bar
// ================================
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');

    function updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

        progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
}

// ================================
// Scroll Reveal Animations
// ================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
}

// ================================
// Feature Items Stagger Animation
// ================================
function initFeatureAnimations() {
    const featureItems = document.querySelectorAll('.feature-item');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

// ================================
// Details Modal (IG-Style Slider)
// ================================
function initDetailsToggle() {
    const viewDetailsBtn = document.getElementById('view-details-btn');
    const modal = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');
    const modalSlides = document.getElementById('modal-slides');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    const paginationDots = document.querySelectorAll('.pagination-dot');
    const currentPageEl = modal?.querySelector('.current-page');
    const totalPagesEl = modal?.querySelector('.total-pages');

    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.modal-slide').length;
    let touchStartX = 0;
    let touchEndX = 0;

    // Open Modal
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            currentSlide = 0;
            updateSlidePosition();

            // Track event
            trackEvent('User Interaction', 'View Details Modal', 'Product Details');
        });
    }

    // Close Modal Function
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll

        // Reset to first slide
        setTimeout(() => {
            currentSlide = 0;
            updateSlidePosition();
        }, 300);
    }

    // Close Button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Backdrop Click
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    // ESC Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Update Slide Position
    function updateSlidePosition() {
        if (!modalSlides) return;

        const offset = currentSlide * -100;
        modalSlides.style.transform = `translateX(${offset}%)`;

        // Update pagination dots
        paginationDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Update page counter
        if (currentPageEl) currentPageEl.textContent = currentSlide + 1;
        if (totalPagesEl) totalPagesEl.textContent = totalSlides;

        // Update navigation buttons
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    // Previous Slide
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlidePosition();
                trackEvent('Modal Navigation', 'Previous Slide', `Slide ${currentSlide + 1}`);
            }
        });
    }

    // Next Slide
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlidePosition();
                trackEvent('Modal Navigation', 'Next Slide', `Slide ${currentSlide + 1}`);
            }
        });
    }

    // Pagination Dots Click
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlidePosition();
            trackEvent('Modal Navigation', 'Dot Click', `Slide ${currentSlide + 1}`);
        });
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('hidden')) return;

        if (e.key === 'ArrowLeft' && currentSlide > 0) {
            currentSlide--;
            updateSlidePosition();
        } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlidePosition();
        }
    });

    // Touch Swipe Support
    if (modalSlides) {
        modalSlides.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modalSlides.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentSlide < totalSlides - 1) {
                // Swipe left - next slide
                currentSlide++;
                updateSlidePosition();
                trackEvent('Modal Navigation', 'Swipe Left', `Slide ${currentSlide + 1}`);
            } else if (diff < 0 && currentSlide > 0) {
                // Swipe right - previous slide
                currentSlide--;
                updateSlidePosition();
                trackEvent('Modal Navigation', 'Swipe Right', `Slide ${currentSlide + 1}`);
            }
        }
    }

    // Mouse Wheel Navigation (optional enhancement)
    if (modal) {
        let wheelTimeout;
        modal.addEventListener('wheel', (e) => {
            if (modal.classList.contains('hidden')) return;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaX > 30 && currentSlide < totalSlides - 1) {
                    currentSlide++;
                    updateSlidePosition();
                } else if (e.deltaX < -30 && currentSlide > 0) {
                    currentSlide--;
                    updateSlidePosition();
                }
            }, 50);
        }, { passive: true });
    }

    // Initialize
    updateSlidePosition();
}

// ================================
// Form Handler
// ================================
function initFormHandler() {
    const feedbackForm = document.getElementById('feedback-form');
    const formMessage = document.getElementById('form-message');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = feedbackForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>提交中...</span>';
            submitButton.style.opacity = '0.7';

            const formData = new FormData(feedbackForm);
            const email = formData.get('Email');
            const price = formData.get('Willing_Price_Range');

            try {
                const response = await fetch(feedbackForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    formMessage.textContent = '✓ 感謝您的回饋！我們會盡快與您聯繫。';
                    formMessage.classList.remove('hidden', 'error');
                    formMessage.classList.add('success');

                    // Animate success message
                    formMessage.style.transform = 'scale(0.9)';
                    formMessage.style.opacity = '0';
                    setTimeout(() => {
                        formMessage.style.transform = 'scale(1)';
                        formMessage.style.opacity = '1';
                    }, 50);

                    // Reset form
                    feedbackForm.reset();

                    // Track success event
                    trackEvent('Lead Generation', 'Form Submission Success', 'Email Collection', {
                        email: email,
                        price_range: price
                    });

                    // Confetti effect (optional - simple celebration)
                    celebrateSubmission();

                } else {
                    // Error
                    const errorData = await response.json().catch(() => ({}));
                    formMessage.textContent = `✗ 提交失敗：${errorData.error || '請稍後再試'}`;
                    formMessage.classList.remove('hidden', 'success');
                    formMessage.classList.add('error');
                }

            } catch (error) {
                console.error('Form submission error:', error);
                formMessage.textContent = '✗ 提交失敗：網路錯誤，請稍後再試';
                formMessage.classList.remove('hidden', 'success');
                formMessage.classList.add('error');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                submitButton.style.opacity = '1';
            }
        });

        // Add input animations
        const inputs = feedbackForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.style.transform = 'translateY(-2px)';
            });

            input.addEventListener('blur', (e) => {
                e.target.parentElement.style.transform = 'translateY(0)';
            });
        });
    }
}

// ================================
// Smooth Scroll for Anchor Links
// ================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================
// Celebration Animation (Simple)
// ================================
function celebrateSubmission() {
    const form = document.getElementById('feedback-form');

    // Create simple success animation
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        opacity: 0;
        pointer-events: none;
        transition: all 0.6s ease;
    `;
    celebration.textContent = '🎉';

    form.style.position = 'relative';
    form.appendChild(celebration);

    // Animate
    setTimeout(() => {
        celebration.style.opacity = '1';
        celebration.style.transform = 'translate(-50%, -150%)';
    }, 50);

    // Remove after animation
    setTimeout(() => {
        celebration.remove();
    }, 1000);
}

// ================================
// Analytics Event Tracking
// ================================
function trackEvent(category, action, label, customData = {}) {
    // Google Analytics 4 (GA4) - using dataLayer
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'custom_event',
            'event_category': category,
            'event_action': action,
            'event_label': label,
            ...customData
        });
    }

    // Universal Analytics (GA3) - legacy support
    if (typeof ga === 'function') {
        ga('send', 'event', category, action, label);
    }

    // Console log for debugging
    console.log('Event tracked:', { category, action, label, customData });
}

// ================================
// Card Hover Effects Enhancement
// ================================
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.problem-card, .benefit-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
});

// ================================
// Parallax Effect for Hero Orbs
// ================================
document.addEventListener('DOMContentLoaded', () => {
    const orbs = document.querySelectorAll('.gradient-orb');

    if (orbs.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;

            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.5;
                orb.style.transform = `translate3d(0, ${rate * speed}px, 0)`;
            });
        });
    }
});

// ================================
// Button Click Ripple Effect
// ================================
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// ================================
// Performance Optimization
// ================================
// Debounce function for scroll events
function debounce(func, wait = 10) {
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

// Throttle function for intensive events
function throttle(func, limit = 16) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================
// Accessibility Enhancements
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard navigation support
    const interactiveElements = document.querySelectorAll('button, a, input, select');

    interactiveElements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                    element.click();
                }
            }
        });
    });

    // Add focus visible styles
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
});

// ================================
// Loading State Management
// ================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
        }
    }, 100);
});

// ================================
// Error Handling
// ================================
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You could send this to an error tracking service
});

// ================================
// Browser Support Check
// ================================
(function checkBrowserSupport() {
    const isModernBrowser =
        'IntersectionObserver' in window &&
        'fetch' in window &&
        'CSS' in window && CSS.supports('display', 'grid');

    if (!isModernBrowser) {
        console.warn('Some features may not work in older browsers');
        // You could show a message to users with older browsers
    }
})();

// ================================
// Console Easter Egg
// ================================
console.log('%c👋 你好！', 'font-size: 2em; color: #667eea;');
console.log('%c對我們的產品感興趣嗎？', 'font-size: 1.2em; color: #764ba2;');
console.log('%c歡迎留下您的 Email！', 'font-size: 1em; color: #4facfe;');
