// Session locking to prevent race conditions in multi-user scenarios
class SessionLockManager {
  constructor() {
    // In-memory locks per phone number
    this.locks = new Map();
    this.lockTimeout = 30000; // 30 seconds max lock time
  }

  async acquireLock(phoneNumber, operation = 'unknown') {
    const lockKey = `session_${phoneNumber}`;

    // Wait for existing lock to release
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait (100ms * 100) - increased from 5s to prevent race conditions

    while (this.locks.has(lockKey) && attempts < maxAttempts) {
      await this.sleep(100);
      attempts++;
    }

    if (this.locks.has(lockKey)) {
      console.warn(`⚠️ Session lock timeout for ${phoneNumber} operation: ${operation}`);
      console.warn(`⚠️ Lock held for ${((Date.now() - this.locks.get(lockKey).acquiredAt) / 1000).toFixed(1)}s - force releasing`);
      // Force release old lock
      this.locks.delete(lockKey);
    }
    
    // Acquire lock
    this.locks.set(lockKey, {
      phoneNumber,
      operation,
      acquiredAt: new Date(),
      timeout: setTimeout(() => {
        console.warn(`🔒 Force releasing session lock for ${phoneNumber} after timeout`);
        this.locks.delete(lockKey);
      }, this.lockTimeout)
    });
    
    console.log(`🔒 Session lock acquired for ${phoneNumber} operation: ${operation}`);
    return lockKey;
  }

  releaseLock(lockKey) {
    const lock = this.locks.get(lockKey);
    if (lock) {
      clearTimeout(lock.timeout);
      this.locks.delete(lockKey);
      console.log(`🔓 Session lock released for ${lock.phoneNumber} operation: ${lock.operation}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wrapper to execute function with session lock
  async withSessionLock(phoneNumber, operation, asyncFunction) {
    const lockKey = await this.acquireLock(phoneNumber, operation);
    
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      this.releaseLock(lockKey);
    }
  }
}

// Global singleton instance
const sessionLockManager = new SessionLockManager();
module.exports = sessionLockManager;