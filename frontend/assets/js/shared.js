/**
 * TextExpense Shared JavaScript
 * Common functionality for all pages (landing pages, blog posts, etc.)
 */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip empty anchors

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Load dynamic WhatsApp number
    loadWhatsAppNumber();

    // Load dynamic config (pricing, etc.) if pricing section exists
    if (document.querySelector('.pricing')) {
        loadDynamicConfig();
    }

    // Setup pricing card interaction if exists
    if (document.querySelectorAll('.pricing-card').length > 0) {
        setupPricingCardInteraction();
    }

    // Track WhatsApp CTA clicks
    trackWhatsAppClicks();
});

/**
 * Load dynamic WhatsApp number from backend
 */
async function loadWhatsAppNumber() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();

        if (data.success && data.whatsappBotNumber) {
            const botNumber = data.whatsappBotNumber;
            console.log('Loaded WhatsApp bot number:', botNumber);

            // Update all WhatsApp links
            const whatsappLinks = document.querySelectorAll('a[href*="wa.me/17654792054"]');
            whatsappLinks.forEach(link => {
                link.href = link.href.replace('17654792054', botNumber);
            });

            console.log('Updated', whatsappLinks.length, 'WhatsApp links');
        }
    } catch (error) {
        console.log('Could not load WhatsApp number, using default');
    }
}

/**
 * Load dynamic pricing configuration from backend
 */
async function loadDynamicConfig() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();

        if (data.success && data.plans) {
            const { trial, lite, pro } = data.plans;

            // Update Trial Plan pricing card
            const trialCard = document.querySelector('.pricing-card[data-plan="trial"]');
            if (trialCard) {
                const trialReceiptLi = trialCard.querySelector('li:first-child');
                if (trialReceiptLi) {
                    trialReceiptLi.textContent = `${trial.receiptLimit} receipts one-time`;
                }
            }

            // Update Lite Plan pricing card
            const liteCard = document.querySelector('.pricing-card[data-plan="lite"]');
            if (liteCard) {
                const litePriceDiv = liteCard.querySelector('.price');
                const liteReceiptLi = liteCard.querySelector('li:first-child');
                if (litePriceDiv) {
                    litePriceDiv.innerHTML = `${lite.priceFormatted}<span>/month</span>`;
                }
                if (liteReceiptLi) {
                    liteReceiptLi.textContent = `${lite.receiptLimit} receipts per month`;
                }
            }

            // Update Pro Plan pricing card
            const proCard = document.querySelector('.pricing-card[data-plan="pro"]');
            if (proCard) {
                const proPriceDiv = proCard.querySelector('.price');
                const proReceiptLi = proCard.querySelector('li:first-child');
                if (proPriceDiv) {
                    proPriceDiv.innerHTML = `${pro.priceFormatted}<span>/month</span>`;
                }
                if (proReceiptLi) {
                    proReceiptLi.textContent = `${pro.receiptLimit} receipts per month`;
                }
            }

            console.log('✅ Dynamic config loaded successfully:', data.plans);
        }
    } catch (error) {
        console.error('❌ Failed to load dynamic config, using defaults:', error);
    }
}

/**
 * Setup interactive pricing cards
 */
function setupPricingCardInteraction() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach((card) => {
        card.addEventListener('click', function(e) {
            // Check if the click is on a button or link inside the card
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                return; // Let the button/link handle its own event
            }

            // Prevent any default behavior for card clicks
            e.preventDefault();
            e.stopPropagation();

            // Remove featured class from all cards
            pricingCards.forEach(c => {
                c.classList.remove('featured');
            });

            // Add featured class to clicked card
            this.classList.add('featured');
        });
    });

    // Setup WhatsApp redirect buttons for pricing plans
    const stripeButtons = document.querySelectorAll('.stripe-button');
    stripeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Redirect to WhatsApp with 'hi' message
            window.open('https://wa.me/17654792054?text=hi', '_blank');
        });
    });
}

/**
 * Track WhatsApp button clicks with Google Analytics
 */
function trackWhatsAppClicks() {
    // Get all links that contain wa.me
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');

    whatsappLinks.forEach(function(link, index) {
        link.addEventListener('click', function(e) {
            // Get button details
            let buttonText = this.textContent.trim();
            let buttonLocation = 'unknown';

            // Identify which section based on HTML structure
            if (this.closest('.hero')) {
                buttonLocation = 'hero';
            } else if (this.closest('.footer-cta')) {
                buttonLocation = 'footer_cta';
            } else if (this.closest('.footer-main')) {
                buttonLocation = 'footer_main';
            } else if (this.closest('header')) {
                buttonLocation = 'header';
            } else if (this.closest('.mid-article-cta')) {
                buttonLocation = 'mid_article';
            } else if (this.closest('.cta-section')) {
                buttonLocation = 'cta_section';
            }

            // Send to GA4 if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'button_location': buttonLocation,
                    'button_text': buttonText,
                    'page_url': window.location.href
                });
            }
        });
    });
}
