#!/bin/bash

# FINAL VALIDATION: Check if any existing files were modified
# Run this BEFORE git commit to ensure the fundamental rule is not broken
# Usage: ./frontend/check-no-existing-touched.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "CHECKING: NO EXISTING FILES TOUCHED"
echo "========================================="
echo ""

ERRORS=0

# List of PROTECTED files that should NEVER be modified
PROTECTED_FILES=(
    "frontend/index.html"
    "frontend/privacy.html"
    "frontend/terms.html"
    "frontend/te-logo.png"
    "server.js"
    "src/**/*.js"
    "package.json"
    "package-lock.json"
)

echo "Checking git status for modified existing files..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ WARNING: Not in a git repository. Cannot check for modifications.${NC}"
    exit 0
fi

# Get list of modified files (not new files)
MODIFIED_FILES=$(git status --porcelain | grep "^ M" | awk '{print $2}')

if [ -z "$MODIFIED_FILES" ]; then
    echo -e "${GREEN}✓ PASS: No existing files have been modified${NC}"
    echo ""
    echo "========================================="
    echo "✓✓✓ VALIDATION PASSED ✓✓✓"
    echo "========================================="
    exit 0
fi

echo -e "${YELLOW}Modified files detected:${NC}"
echo "$MODIFIED_FILES"
echo ""

# Check if any modified file is a protected file
for file in $MODIFIED_FILES; do
    # Check against protected files
    if [[ "$file" == "frontend/index.html" ]] || \
       [[ "$file" == "frontend/privacy.html" ]] || \
       [[ "$file" == "frontend/terms.html" ]] || \
       [[ "$file" == "frontend/te-logo.png" ]] || \
       [[ "$file" == "server.js" ]] || \
       [[ "$file" == src/* ]] || \
       [[ "$file" == "package.json" ]] || \
       [[ "$file" == "package-lock.json" ]]; then
        echo -e "${RED}✗✗✗ CRITICAL ERROR ✗✗✗${NC}"
        echo -e "${RED}PROTECTED FILE MODIFIED: $file${NC}"
        echo ""
        echo "This violates the FUNDAMENTAL RULE:"
        echo "NEVER TOUCH EXISTING FRONTEND OR BACKEND CODE"
        echo ""
        echo "Protected files:"
        echo "  - frontend/index.html"
        echo "  - frontend/privacy.html"
        echo "  - frontend/terms.html"
        echo "  - frontend/te-logo.png"
        echo "  - server.js"
        echo "  - src/**/*.js (all backend code)"
        echo "  - package.json"
        echo "  - package-lock.json"
        echo ""
        echo "ACTION REQUIRED:"
        echo "1. Revert changes to $file"
        echo "2. Find alternative solution that doesn't modify existing code"
        echo ""
        ((ERRORS++))
    fi
done

# Check for modifications in src/ directory (backend)
BACKEND_MODIFIED=$(echo "$MODIFIED_FILES" | grep "^src/" || true)
if [ ! -z "$BACKEND_MODIFIED" ]; then
    echo -e "${RED}✗✗✗ CRITICAL ERROR ✗✗✗${NC}"
    echo -e "${RED}BACKEND CODE MODIFIED${NC}"
    echo ""
    echo "Modified backend files:"
    echo "$BACKEND_MODIFIED"
    echo ""
    echo "This violates the FUNDAMENTAL RULE:"
    echo "NEVER TOUCH BACKEND CODE"
    echo ""
    ((ERRORS++))
fi

if [ $ERRORS -eq 0 ]; then
    # Files were modified but they're not protected
    echo -e "${GREEN}✓ PASS: Modified files are allowed (not protected)${NC}"
    echo ""
    echo "Modified files:"
    echo "$MODIFIED_FILES"
    echo ""
    echo "========================================="
    echo "✓✓✓ VALIDATION PASSED ✓✓✓"
    echo "========================================="
    exit 0
else
    echo "========================================="
    echo "✗✗✗ VALIDATION FAILED ✗✗✗"
    echo "========================================="
    echo ""
    echo "FIX CRITICAL ERRORS BEFORE COMMITTING!"
    exit 1
fi
