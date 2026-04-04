import { NextRequest } from "next/server";

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval?: number;
};

const LRU = (maxEntries: number) => {
  const cache = new Map<string, { count: number; lastReset: number }>();
  return {
    check: (limit: number, token: string, interval: number) => {
      const now = Date.now();
      const tokenEntry = cache.get(token) || { count: 0, lastReset: now };

      if (now - tokenEntry.lastReset > interval) {
        tokenEntry.count = 0;
        tokenEntry.lastReset = now;
      }

      tokenEntry.count += 1;
      cache.set(token, tokenEntry);

      if (cache.size > maxEntries) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }

      return tokenEntry.count <= limit;
    },
  };
};

export const createRateLimiter = (options: RateLimitOptions) => {
  const tokenCache = LRU(options.uniqueTokenPerInterval || 500);

  return {
    check: (limit: number, token: string) => {
      return tokenCache.check(limit, token, options.interval);
    },
  };
};

export const aiLimiter = createRateLimiter({ interval: 60 * 1000 });
export const authLimiter = createRateLimiter({ interval: 15 * 60 * 1000 });
export const apiLimiter = createRateLimiter({ interval: 60 * 1000 });

export const rateLimitResponse = () => {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message:
        "Please slow down. You have reached your API limit for this minute.",
    }),
    {
      status: 429,
      headers: { "Content-Type": "application/json" },
    }
  );
};
