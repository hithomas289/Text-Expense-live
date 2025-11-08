# STRUCTURE REFERENCE - MANDATORY FOR ALL NEW PAGES

**CRITICAL RULES:**
1. NEVER touch existing frontend files (index.html, privacy.html, terms.html)
2. NEVER touch backend code
3. NEVER create new CSS classes - only use what exists in shared.css
4. ALWAYS copy exact structure from index.html
5. ALWAYS validate with test-page.sh before committing
6. ALWAYS manually test in browser before committing
7. ALWAYS document changes in CHANGELOG.md

---

## EXACT HTML STRUCTURE TO COPY

### 1. NAVIGATION (Copy from index.html lines 1500-1518)

```html
<!-- Header -->
<header>
    <div class="container">
        <nav>
            <a href="/" class="logo">
                <img src="/te-logo.png" alt="TextExpense Logo" style="width: 40px; height: 40px;">
                TextExpense
            </a>

            <!-- Desktop Navigation -->
            <ul class="nav-links">
                <li><a href="/#solution">How It Works</a></li>
                <li><a href="/#pricing">Pricing</a></li>
                <li><a href="/blog/">Blog</a></li>
            </ul>

            <!-- CTA Button -->
            <a href="https://wa.me/17654792054?text=hi" class="cta-button">Start Now</a>

            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn">☰</button>
        </nav>
    </div>
</header>
```

**CRITICAL CSS CLASSES:**
- `<header>` - NO CLASS attribute
- `<nav>` - NO CLASS attribute
- `<a class="logo">` - NOT "nav-logo"
- `<ul class="nav-links">` - NOT "nav-menu"
- `<button class="mobile-menu-btn">` - NOT "nav-toggle"

---

### 2. HERO SECTION (Copy from index.html lines 1522-1555)

```html
<section class="hero">
    <div class="container">
        <div class="hero-content">
            <h1>Your Headline Here</h1>
            <p>Your subtitle here</p>

            <div class="hero-cta">
                <a href="https://wa.me/17654792054?text=hi" class="whatsapp-number">
                    📱 Try Your First Receipt Free
                </a>
                <p style="color: var(--gray); font-size: 16px;">✓ No app download</p>
            </div>

            <div class="trust-indicators">
                <div class="trust-item">
                    <span>🔒</span>
                    <span>Bank-level security</span>
                </div>
                <div class="trust-item">
                    <span>⚡</span>
                    <span>Instant processing</span>
                </div>
                <div class="trust-item">
                    <span>📊</span>
                    <span>Excel export ready</span>
                </div>
            </div>
        </div>
    </div>
</section>
```

**CRITICAL CSS CLASSES:**
- `<section class="hero">`
- `<div class="hero-content">`
- `<div class="hero-cta">`
- `<a class="whatsapp-number">` - for WhatsApp CTAs
- `<div class="trust-indicators">`

---

### 3. CONTENT SECTIONS

```html
<section class="content-section">
    <div class="container">
        <div class="section-header">
            <h2>Section Title</h2>
            <p>Optional subtitle</p>
        </div>

        <div class="article-content" style="max-width: 900px; margin: 0 auto;">
            <p>Your content here</p>
        </div>
    </div>
</section>

<!-- Alternate background -->
<section class="content-section alt-bg">
    <!-- Same structure -->
</section>
```

**CRITICAL CSS CLASSES:**
- `<section class="content-section">` - NOT "section"
- `<div class="section-header">` - for generic sections
- `<div class="article-content">` - for text content

---

### 4. FEATURES GRID

```html
<section class="content-section">
    <div class="container">
        <div class="section-header">
            <h2>Features</h2>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">📱</div>
                <h3>Feature Title</h3>
                <p>Feature description</p>
            </div>
            <!-- Repeat feature-card -->
        </div>
    </div>
</section>
```

**CRITICAL CSS CLASSES:**
- `<div class="features-grid">` - grid container
- `<div class="feature-card">` - individual cards
- `<div class="feature-icon">` - icon container

---

### 5. PRICING SECTION (Copy from index.html lines 1833-1875)

```html
<section id="pricing" class="pricing">
    <div class="container">
        <div class="pricing-header">
            <h2>Pricing</h2>
            <p>Subtitle here</p>
        </div>

        <div class="pricing-grid">
            <!-- Trial Plan -->
            <div class="pricing-card" data-plan="trial">
                <h3>Trial</h3>
                <div class="price">Free<span></span></div>
                <ul>
                    <li>Limited receipts one-time</li>
                    <li>Basic categorization</li>
                    <li>Excel export</li>
                    <li>WhatsApp support</li>
                </ul>
                <a href="https://wa.me/17654792054?text=hi" class="cta-button">Get Started</a>
            </div>

            <!-- Lite Plan -->
            <div class="pricing-card featured" data-plan="lite">
                <h3>Lite</h3>
                <div class="price">Loading...<span>/month</span></div>
                <ul>
                    <li>Monthly receipt allowance</li>
                    <li>Basic categorization</li>
                    <li>Excel export</li>
                    <li>WhatsApp support</li>
                </ul>
                <button class="cta-button stripe-button" data-plan="lite">Get Lite</button>
            </div>

            <!-- Pro Plan -->
            <div class="pricing-card" data-plan="pro">
                <h3>Pro</h3>
                <div class="price">Loading...<span>/month</span></div>
                <ul>
                    <li>Generous monthly receipt limit</li>
                    <li>Smart categorization</li>
                    <li>Advanced Excel reports</li>
                    <li>Priority support</li>
                </ul>
                <button class="cta-button stripe-button" data-plan="pro">Get Pro</button>
            </div>
        </div>
    </div>
</section>
```

**CRITICAL CSS CLASSES:**
- `<section class="pricing">` - NOT "pricing-section"
- `<div class="pricing-header">` - NOT "section-header"
- `<div class="pricing-grid">` - NOT "pricing-cards"
- `<div class="pricing-card">` - individual cards
- `data-plan="trial"` - REQUIRED for dynamic pricing
- `data-plan="lite"` - REQUIRED for dynamic pricing
- `data-plan="pro"` - REQUIRED for dynamic pricing

---

### 6. FAQ SECTION (Copy from index.html lines ~1879-1950)

```html
<section class="faq">
    <div class="container">
        <div class="faq-header">
            <h2>Frequently Asked Questions</h2>
        </div>

        <div class="faq-container">
            <div class="faq-item">
                <div class="faq-question">
                    <h3>Your question here?</h3>
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <p>Your answer here</p>
                </div>
            </div>
            <!-- Repeat faq-item -->
        </div>
    </div>
</section>

<!-- FAQ Toggle Script (REQUIRED at end of body) -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all FAQ items
                faqItems.forEach(faq => faq.classList.remove('active'));

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    });
</script>
```

**CRITICAL CSS CLASSES:**
- `<section class="faq">` - NOT "faq-section"
- `<div class="faq-header">` - NOT "section-header"
- `<div class="faq-container">` - NOT "faq-list"
- `<div class="faq-item">` - individual Q&A
- `<div class="faq-question">` - question wrapper
- `<span class="faq-toggle">` - +/- symbol
- `<div class="faq-answer">` - answer wrapper

---

### 7. CTA SECTION

```html
<section class="cta-section">
    <div class="container">
        <h2>Your CTA Headline</h2>
        <p>Supporting text</p>
        <a href="https://wa.me/17654792054?text=hi" class="cta-button">📱 Get Started</a>
        <p style="margin-top: 20px; opacity: 0.9;">Additional text</p>
    </div>
</section>
```

**CRITICAL CSS CLASSES:**
- `<section class="cta-section">`
- `<a class="cta-button">` - primary CTA button

---

### 8. RELATED PAGES SECTION

```html
<section class="related-content">
    <div class="container">
        <div class="section-header">
            <h2>Related Pages</h2>
            <p>Explore more ways TextExpense can help you</p>
        </div>

        <div class="related-grid">
            <a href="/pages/page-slug.html" class="related-card">
                <h3>Page Title</h3>
                <p>Description</p>
            </a>
            <!-- Repeat for 3 cards -->
        </div>
    </div>
</section>
```

**CRITICAL CSS CLASSES:**
- `<section class="related-content">`
- `<div class="related-grid">` - grid container
- `<a class="related-card">` - clickable cards

---

### 9. FOOTER (Copy from index.html)

```html
<footer id="contact">
    <!-- Footer CTA -->
    <section class="footer-cta">
        <div class="container">
            <h2>Stop Losing Money Today</h2>
            <p>Supporting text</p>
            <div class="footer-cta-actions">
                <a href="https://wa.me/17654792054?text=hi" class="cta-button">📱 Get Started Now</a>
            </div>
        </div>
    </section>

    <!-- Footer Main -->
    <div class="footer-main">
        <div class="container">
            <div class="footer-content">
                <!-- Company Info -->
                <div class="footer-section">
                    <div class="footer-logo">
                        <img src="/te-logo.png" alt="TextExpense Logo" style="width: 32px; height: 32px;">
                        <h3>TextExpense</h3>
                    </div>
                    <p>The simplest way to manage receipts via WhatsApp.</p>
                    <div class="footer-contact">
                        <p>Text your first receipt now:</p>
                        <a href="https://wa.me/17654792054?text=hi" class="whatsapp-link">📱 Start on WhatsApp</a>
                    </div>
                </div>

                <!-- Product Links -->
                <div class="footer-section">
                    <h3>Product</h3>
                    <ul>
                        <li><a href="/#solution">How It Works</a></li>
                        <li><a href="/#pricing">Pricing</a></li>
                        <li><a href="/#use-cases">Use Cases</a></li>
                        <li><a href="/#faq">FAQ</a></li>
                    </ul>
                </div>

                <!-- Legal Links -->
                <div class="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                    </ul>
                </div>

                <!-- Get Started -->
                <div class="footer-section">
                    <h3>Get Started</h3>
                    <p>Text your first receipt now:</p>
                    <a href="https://wa.me/17654792054?text=hi" class="cta-button footer-cta-btn">📱 Start Free</a>
                </div>
            </div>

            <!-- Footer Bottom -->
            <div class="footer-bottom">
                <p>&copy; 2025 TextExpense. All rights reserved.</p>
            </div>
        </div>
    </div>
</footer>
```

---

## REQUIRED SCRIPTS AT END OF BODY

```html
<!-- Shared JavaScript -->
<script src="/assets/js/shared.js"></script>

<!-- FAQ Toggle Script (if FAQ section exists) -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all FAQ items
                faqItems.forEach(faq => faq.classList.remove('active'));

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    });
</script>
```

---

## WHATSAPP CTA RULES

**ALL WhatsApp links MUST use this exact format:**
```html
<a href="https://wa.me/17654792054?text=hi" class="cta-button">📱 Your CTA Text</a>
```

**Or for whatsapp-number style:**
```html
<a href="https://wa.me/17654792054?text=hi" class="whatsapp-number">📱 Your CTA Text</a>
```

**NEVER modify the URL format. The number will be replaced dynamically by shared.js**

---

## FORBIDDEN CLASS NAMES

**These class names DO NOT EXIST in shared.css. NEVER use them:**

❌ `class="header"`
❌ `class="nav"`
❌ `class="nav-logo"`
❌ `class="nav-menu"`
❌ `class="nav-toggle"`
❌ `class="pricing-section"`
❌ `class="pricing-cards"`
❌ `class="faq-section"`
❌ `class="faq-list"`
❌ `class="cta-button-small"`

---

## VALIDATION CHECKLIST

Before committing ANY new page, run:
```bash
./frontend/test-page.sh path/to/new-page.html
```

This will verify:
- No forbidden class names
- Correct pricing structure
- Correct FAQ structure
- Correct navigation structure
- All WhatsApp links correct
- Dynamic pricing attributes exist
- Shared.css and shared.js loaded
- Google Analytics configured

---

## MANDATORY WORKFLOW

1. **Read this file COMPLETELY**
2. **Copy exact structures from above**
3. **Replace only content, NEVER structure**
4. **Run validation script: `./frontend/test-page.sh path/to/page.html`**
5. **FINAL CHECK: `./frontend/check-no-existing-touched.sh`** ⚠️ CRITICAL
6. **Manually test in browser**
7. **Update CHANGELOG.md**
8. **Commit with clear message**
9. **Push to branch**

---

## FUNDAMENTAL RULE - NEVER VIOLATED

**🚨 UNDER NO CIRCUMSTANCES MODIFY EXISTING FILES 🚨**

**PROTECTED FILES (NEVER TOUCH):**
- ❌ `frontend/index.html`
- ❌ `frontend/privacy.html`
- ❌ `frontend/terms.html`
- ❌ `frontend/te-logo.png`
- ❌ `server.js` (or ANY backend file)
- ❌ `src/**/*.js` (ALL backend code)
- ❌ `package.json`
- ❌ `package-lock.json`

**If a feature requires modifying existing code → DO NOT IMPLEMENT IT**

Examples:
- Clean URLs? ❌ Requires server.js changes → Keep .html extensions
- Change navigation? ❌ Requires index.html changes → Don't do it
- Backend changes? ❌ NEVER TOUCH BACKEND

**FINAL VALIDATION:**
```bash
./frontend/check-no-existing-touched.sh
```
This script MUST pass before every commit.
