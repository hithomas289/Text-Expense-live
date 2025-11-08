#!/bin/bash

# MANDATORY PAGE VALIDATION SCRIPT
# Run this BEFORE committing any new landing page or blog post
# Usage: ./frontend/test-page.sh path/to/page.html

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}ERROR: No file specified${NC}"
    echo "Usage: ./frontend/test-page.sh path/to/page.html"
    exit 1
fi

PAGE_FILE="$1"

if [ ! -f "$PAGE_FILE" ]; then
    echo -e "${RED}ERROR: File not found: $PAGE_FILE${NC}"
    exit 1
fi

echo "========================================="
echo "VALIDATING PAGE: $PAGE_FILE"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Test 1: Check for FORBIDDEN class names
echo "Test 1: Checking for forbidden class names..."
FORBIDDEN=(
    'class="header"'
    'class="nav"'
    'class="nav-logo"'
    'class="nav-menu"'
    'class="nav-toggle"'
    'class="pricing-section"'
    'class="pricing-cards"'
    'class="faq-section"'
    'class="faq-list"'
    'class="cta-button-small"'
)

for forbidden in "${FORBIDDEN[@]}"; do
    if grep -q "$forbidden" "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Found forbidden $forbidden${NC}"
        echo "  Line: $(grep -n "$forbidden" "$PAGE_FILE" | cut -d: -f1)"
        ((ERRORS++))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ PASS: No forbidden class names found${NC}"
fi
echo ""

# Test 2: Check for REQUIRED navigation structure
echo "Test 2: Checking navigation structure..."
if ! grep -q '<header>' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing <header> tag${NC}"
    ((ERRORS++))
fi

if ! grep -q 'class="logo"' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing class=\"logo\"${NC}"
    ((ERRORS++))
fi

if ! grep -q 'class="nav-links"' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing class=\"nav-links\"${NC}"
    ((ERRORS++))
fi

if ! grep -q 'class="mobile-menu-btn"' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing class=\"mobile-menu-btn\"${NC}"
    ((ERRORS++))
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ PASS: Navigation structure correct${NC}"
fi
echo ""

# Test 3: Check for REQUIRED pricing structure
echo "Test 3: Checking pricing structure..."
if grep -q 'pricing' "$PAGE_FILE"; then
    if ! grep -q 'class="pricing"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Found pricing but wrong class (should be class=\"pricing\")${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="pricing-header"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"pricing-header\"${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="pricing-grid"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"pricing-grid\" (found pricing-cards?)${NC}"
        ((ERRORS++))
    fi

    # Check for data-plan attributes
    if ! grep -q 'data-plan="trial"' "$PAGE_FILE"; then
        echo -e "${YELLOW}⚠ WARNING: Missing data-plan=\"trial\"${NC}"
        ((WARNINGS++))
    fi

    if ! grep -q 'data-plan="lite"' "$PAGE_FILE"; then
        echo -e "${YELLOW}⚠ WARNING: Missing data-plan=\"lite\"${NC}"
        ((WARNINGS++))
    fi

    if ! grep -q 'data-plan="pro"' "$PAGE_FILE"; then
        echo -e "${YELLOW}⚠ WARNING: Missing data-plan=\"pro\"${NC}"
        ((WARNINGS++))
    fi

    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✓ PASS: Pricing structure correct${NC}"
    fi
else
    echo -e "${YELLOW}⚠ SKIP: No pricing section found${NC}"
fi
echo ""

# Test 4: Check for REQUIRED FAQ structure
echo "Test 4: Checking FAQ structure..."
if grep -q 'faq' "$PAGE_FILE"; then
    if ! grep -q 'class="faq"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Found FAQ but wrong class (should be class=\"faq\")${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="faq-header"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"faq-header\"${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="faq-container"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"faq-container\" (found faq-list?)${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="faq-item"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"faq-item\"${NC}"
        ((ERRORS++))
    fi

    if ! grep -q 'class="faq-toggle"' "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing class=\"faq-toggle\"${NC}"
        ((ERRORS++))
    fi

    # Check for FAQ toggle script (accept both patterns)
    if ! grep -q "faqItems.forEach\|faq-question.*forEach" "$PAGE_FILE"; then
        echo -e "${RED}✗ FAIL: Missing FAQ toggle JavaScript${NC}"
        ((ERRORS++))
    fi

    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✓ PASS: FAQ structure correct${NC}"
    fi
else
    echo -e "${YELLOW}⚠ SKIP: No FAQ section found${NC}"
fi
echo ""

# Test 5: Check WhatsApp CTA links
echo "Test 5: Checking WhatsApp CTA links..."
WA_COUNT=$(grep -c "wa.me/17654792054" "$PAGE_FILE" || true)
if [ $WA_COUNT -eq 0 ]; then
    echo -e "${RED}✗ FAIL: No WhatsApp links found${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: Found $WA_COUNT WhatsApp links${NC}"

    # Check for correct format
    if grep -q "wa.me/17654792054?text=hi" "$PAGE_FILE"; then
        echo -e "${GREEN}✓ PASS: WhatsApp links have correct format${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING: WhatsApp links might be missing ?text=hi${NC}"
        ((WARNINGS++))
    fi
fi
echo ""

# Test 6: Check for shared.css
echo "Test 6: Checking for shared.css..."
if ! grep -q 'href="/assets/css/shared.css"' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing shared.css link${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: shared.css linked correctly${NC}"
fi
echo ""

# Test 7: Check for shared.js
echo "Test 7: Checking for shared.js..."
if ! grep -q 'src="/assets/js/shared.js"' "$PAGE_FILE"; then
    echo -e "${RED}✗ FAIL: Missing shared.js script${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: shared.js linked correctly${NC}"
fi
echo ""

# Test 8: Check for Google Analytics
echo "Test 8: Checking Google Analytics..."
if ! grep -q 'G-B7MY1B07FE\|G-HMSDHWE3BS' "$PAGE_FILE"; then
    echo -e "${YELLOW}⚠ WARNING: Missing Google Analytics tracking ID${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ PASS: Google Analytics configured${NC}"
fi
echo ""

# Test 9: Check for SEO meta tags
echo "Test 9: Checking SEO meta tags..."
if ! grep -q '<meta name="description"' "$PAGE_FILE"; then
    echo -e "${YELLOW}⚠ WARNING: Missing meta description${NC}"
    ((WARNINGS++))
fi

if ! grep -q '<meta name="keywords"' "$PAGE_FILE"; then
    echo -e "${YELLOW}⚠ WARNING: Missing meta keywords${NC}"
    ((WARNINGS++))
fi

if ! grep -q 'application/ld+json' "$PAGE_FILE"; then
    echo -e "${YELLOW}⚠ WARNING: Missing schema.org markup${NC}"
    ((WARNINGS++))
fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ PASS: All SEO meta tags present${NC}"
fi
echo ""

# Final summary
echo "========================================="
echo "VALIDATION SUMMARY"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ ALL TESTS PASSED ✓✓✓${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) - review recommended${NC}"
    fi
    echo ""
    echo "Page is ready to commit!"
    exit 0
else
    echo -e "${RED}✗✗✗ $ERRORS ERROR(S) FOUND ✗✗✗${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "FIX ERRORS BEFORE COMMITTING!"
    echo ""
    echo "Refer to: frontend/STRUCTURE-REFERENCE.md"
    exit 1
fi
