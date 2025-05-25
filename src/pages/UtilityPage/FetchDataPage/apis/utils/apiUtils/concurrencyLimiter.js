/**
 * Manages concurrent API requests to prevent overloading
 */
export class ConcurrencyLimiter {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.currentConcurrent = 0;
    this.queue = [];
  }

  /**
   * Executes a function with concurrency control
   */
  async execute(fn) {
    // If we're under the limit, execute immediately
    if (this.currentConcurrent < this.maxConcurrent) {
      return this.runTask(fn);
    }

    // Otherwise queue the task
    return new Promise((resolve, reject) => {
      this.queue.push(() => this.runTask(fn).then(resolve).catch(reject));
    });
  }

  /**
   * Runs a task and manages concurrency count
   */
  async runTask(fn) {
    this.currentConcurrent++;
    try {
      return await fn();
    } finally {
      this.currentConcurrent--;
      this.processQueue();
    }
  }

  /**
   * Process next item in the queue if available
   */
  processQueue() {
    if (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const nextTask = this.queue.shift();
      nextTask();
    }
  }

  /**
   * Set the maximum concurrency limit
   */
  setMaxConcurrent(max) {
    this.maxConcurrent = max;
    // Process queue in case we increased the limit
    while (
      this.currentConcurrent < this.maxConcurrent &&
      this.queue.length > 0
    ) {
      this.processQueue();
    }
  }
}

// Create a singleton instance
export const concurrencyLimiter = new ConcurrencyLimiter(3);
