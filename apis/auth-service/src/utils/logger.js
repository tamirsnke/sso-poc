class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
    }
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }
}

module.exports = new Logger();
// Contains AI-generated edits.
