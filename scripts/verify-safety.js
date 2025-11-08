#!/usr/bin/env node

/**
 * Safety Verification Script
 * Ensures no protected files are modified before git operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Files that should NEVER be modified
const PROTECTED_FILES = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env',
  'frontend/index.html',
  'frontend/privacy.html',
  'frontend/terms.html',
  'frontend/te-logo.png',
];

// Directories that should NEVER have files modified
const PROTECTED_DIRS = [
  'src/',
  'node_modules/',
  '.git/',
];

// Directories where modifications are ALLOWED
const ALLOWED_DIRS = [
  'frontend/blog/',
  'frontend/pages/',
  'frontend/templates/',
  'scripts/',
];

class SafetyVerifier {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.allowed = [];
  }

  /**
   * Check git status for modified files
   */
  checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const lines = status.split('\n').filter(line => line.trim());

      console.log('🔍 Checking for unsafe file modifications...\n');

      if (lines.length === 0) {
        console.log('✅ No changes detected - working tree clean\n');
        return true;
      }

      lines.forEach(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3).trim();

        this.checkFile(file, status);
      });

      return this.violations.length === 0;

    } catch (error) {
      console.error('❌ Error checking git status:', error.message);
      return false;
    }
  }

  /**
   * Check if a file is safe to modify
   */
  checkFile(file, status) {
    // Check if file is in protected files list
    if (PROTECTED_FILES.includes(file)) {
      this.violations.push({
        file,
        status,
        reason: 'File is in protected files list',
        severity: 'CRITICAL'
      });
      return;
    }

    // Check if file is in protected directory
    for (const protectedDir of PROTECTED_DIRS) {
      if (file.startsWith(protectedDir)) {
        this.violations.push({
          file,
          status,
          reason: `File is in protected directory: ${protectedDir}`,
          severity: 'CRITICAL'
        });
        return;
      }
    }

    // Check if file is in allowed directory
    let isAllowed = false;
    for (const allowedDir of ALLOWED_DIRS) {
      if (file.startsWith(allowedDir)) {
        isAllowed = true;
        this.allowed.push({ file, status });
        break;
      }
    }

    // Check for root-level files that aren't explicitly protected
    if (!isAllowed && !file.includes('/')) {
      // Root level files need special attention
      if (file === 'AGENT_CHANGELOG.md' || file === 'README.md') {
        this.allowed.push({ file, status });
      } else if (file.endsWith('.md') || file.endsWith('.txt')) {
        this.warnings.push({
          file,
          status,
          reason: 'Root-level documentation file - verify this is intentional',
          severity: 'WARNING'
        });
      } else {
        this.violations.push({
          file,
          status,
          reason: 'Root-level file modification - may be unsafe',
          severity: 'HIGH'
        });
      }
    } else if (!isAllowed) {
      this.warnings.push({
        file,
        status,
        reason: 'File not in explicitly allowed directories',
        severity: 'WARNING'
      });
    }
  }

  /**
   * Print results
   */
  printResults() {
    console.log('─'.repeat(70));

    if (this.allowed.length > 0) {
      console.log('\n✅ SAFE MODIFICATIONS:\n');
      this.allowed.forEach(({ file, status }) => {
        const statusMap = {
          'M': 'Modified',
          'A': 'Added',
          'D': 'Deleted',
          '??': 'Untracked'
        };
        console.log(`   ${statusMap[status] || status}: ${file}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Review Carefully):\n');
      this.warnings.forEach(({ file, status, reason, severity }) => {
        console.log(`   ${severity}: ${file}`);
        console.log(`   └─ ${reason}\n`);
      });
    }

    if (this.violations.length > 0) {
      console.log('\n❌ CRITICAL VIOLATIONS (DO NOT COMMIT):\n');
      this.violations.forEach(({ file, status, reason, severity }) => {
        console.log(`   ${severity}: ${file}`);
        console.log(`   └─ ${reason}\n`);
      });
    }

    console.log('─'.repeat(70));

    if (this.violations.length > 0) {
      console.log('\n🚨 SAFETY CHECK FAILED');
      console.log('   You have attempted to modify protected files.');
      console.log('   Please revert these changes before committing.\n');
      console.log('   Protected files:');
      PROTECTED_FILES.forEach(file => console.log(`   - ${file}`));
      console.log('\n   Protected directories:');
      PROTECTED_DIRS.forEach(dir => console.log(`   - ${dir}`));
      console.log('');
      return false;
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS DETECTED');
      console.log('   Review warnings carefully before proceeding.');
      console.log('   If you\'re sure these changes are safe, you may proceed.\n');
    }

    if (this.violations.length === 0 && this.allowed.length > 0) {
      console.log('\n✅ SAFETY CHECK PASSED');
      console.log('   All modifications are in allowed directories.');
      console.log('   Safe to commit.\n');
    }

    return true;
  }

  /**
   * Verify specific files exist and haven't been modified
   */
  verifyProtectedFilesIntact() {
    console.log('🔒 Verifying protected files are intact...\n');

    let allIntact = true;

    PROTECTED_FILES.forEach(file => {
      const fullPath = path.join(process.cwd(), file);

      if (!fs.existsSync(fullPath)) {
        // File doesn't exist - might be okay if it never existed
        return;
      }

      try {
        // Check if file has uncommitted changes
        const diff = execSync(`git diff ${file}`, { encoding: 'utf8' });
        const diffStaged = execSync(`git diff --staged ${file}`, { encoding: 'utf8' });

        if (diff || diffStaged) {
          console.log(`❌ ${file} has been modified!`);
          allIntact = false;
        } else {
          console.log(`✅ ${file} - intact`);
        }
      } catch (error) {
        // File might be untracked, which is okay for new protected files
      }
    });

    console.log('');
    return allIntact;
  }
}

// CLI Usage
if (require.main === module) {
  const verifier = new SafetyVerifier();

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🛡️  SAFETY VERIFICATION SYSTEM                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const gitStatusSafe = verifier.checkGitStatus();
  const protectedIntact = verifier.verifyProtectedFilesIntact();
  const resultsSafe = verifier.printResults();

  const allSafe = gitStatusSafe && protectedIntact && resultsSafe;

  process.exit(allSafe ? 0 : 1);
}

module.exports = SafetyVerifier;
