interface DomainBucket {
  maxRequests: number;
  tokens: number;
  lastRefill: number;
}

const WINDOW_MS = 60_000;

export class RateLimiter {
  private domains: Map<string, DomainBucket>;

  constructor() {
    const now = Date.now();
    this.domains = new Map([
      ["charts_metrics", { maxRequests: 5, tokens: 5, lastRefill: now }],
      ["customer_information", { maxRequests: 480, tokens: 480, lastRefill: now }],
      ["project_configuration", { maxRequests: 60, tokens: 60, lastRefill: now }],
    ]);
  }

  private refill(bucket: DomainBucket): void {
    const elapsed = Date.now() - bucket.lastRefill;
    if (elapsed >= WINDOW_MS) {
      bucket.tokens = bucket.maxRequests;
      bucket.lastRefill = Date.now();
    }
  }

  async acquire(domain: string): Promise<void> {
    const bucket = this.domains.get(domain);
    if (!bucket) return;

    this.refill(bucket);

    if (bucket.tokens <= 0) {
      const waitMs = WINDOW_MS - (Date.now() - bucket.lastRefill);
      if (waitMs > 0) {
        await new Promise((r) => setTimeout(r, waitMs));
      }
      this.refill(bucket);
    }

    bucket.tokens--;
  }

  updateFromHeaders(domain: string, usage: number, limit: number): void {
    const bucket = this.domains.get(domain);
    if (!bucket) return;
    bucket.maxRequests = limit;
    bucket.tokens = Math.max(0, limit - usage);
  }
}
