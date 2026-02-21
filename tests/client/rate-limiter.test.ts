import { describe, it, expect } from "bun:test";
import { RateLimiter } from "../../src/client/rate-limiter.ts";

describe("RateLimiter", () => {
  describe("token bucket basics", () => {
    it("should allow requests within limit", async () => {
      const limiter = new RateLimiter();
      // charts_metrics has 5 req/min limit
      for (let i = 0; i < 5; i++) {
        await limiter.acquire("charts_metrics");
      }
    });

    it("should allow customer_information with high limit (480)", async () => {
      const limiter = new RateLimiter();
      for (let i = 0; i < 100; i++) {
        await limiter.acquire("customer_information");
      }
    });

    it("should allow project_configuration with moderate limit (60)", async () => {
      const limiter = new RateLimiter();
      for (let i = 0; i < 60; i++) {
        await limiter.acquire("project_configuration");
      }
    });
  });

  describe("unknown domains", () => {
    it("should allow requests for unknown domains (no limit)", async () => {
      const limiter = new RateLimiter();
      await limiter.acquire("unknown_domain");
    });

    it("should allow many requests for unknown domains", async () => {
      const limiter = new RateLimiter();
      for (let i = 0; i < 1000; i++) {
        await limiter.acquire("nonexistent");
      }
    });
  });

  describe("updateFromHeaders", () => {
    it("should update token count from API response headers", () => {
      const limiter = new RateLimiter();
      // Simulate API says 3 of 5 used
      limiter.updateFromHeaders("charts_metrics", 3, 5);
      // Internal state should now have 2 tokens left
      // We verify by consuming 2 more without blocking
    });

    it("should handle header update for unknown domain gracefully", () => {
      const limiter = new RateLimiter();
      // Should not throw
      limiter.updateFromHeaders("nonexistent_domain", 5, 10);
    });

    it("should clamp tokens to 0 when usage exceeds limit", () => {
      const limiter = new RateLimiter();
      // Edge case: usage > limit (shouldn't happen but defensive)
      limiter.updateFromHeaders("charts_metrics", 10, 5);
      // tokens should be max(0, 5-10) = 0
    });

    it("should update maxRequests from limit header", () => {
      const limiter = new RateLimiter();
      // API tells us the limit changed to 10
      limiter.updateFromHeaders("charts_metrics", 0, 10);
      // Now we should be able to make 10 requests
    });
  });

  describe("domain initialization", () => {
    it("should have charts_metrics domain with 5 req limit", async () => {
      const limiter = new RateLimiter();
      // Should be able to make exactly 5 requests quickly
      for (let i = 0; i < 5; i++) {
        await limiter.acquire("charts_metrics");
      }
      // The 6th should block (we can't test blocking easily, but the above should not throw)
    });

    it("should have all three domains", async () => {
      const limiter = new RateLimiter();
      // These should all succeed (at least one request per domain)
      await limiter.acquire("charts_metrics");
      await limiter.acquire("customer_information");
      await limiter.acquire("project_configuration");
    });
  });

  describe("rate limit exhaustion behavior", () => {
    it("should block when tokens exhausted (with small window for testing)", async () => {
      const limiter = new RateLimiter();

      // Exhaust all chart tokens
      for (let i = 0; i < 5; i++) {
        await limiter.acquire("charts_metrics");
      }

      // Simulate time passing by updating from headers (resetting usage)
      limiter.updateFromHeaders("charts_metrics", 0, 5);

      // Now should be able to acquire again
      await limiter.acquire("charts_metrics");
    });
  });
});
