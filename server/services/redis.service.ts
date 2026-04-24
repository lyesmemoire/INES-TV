import { Redis } from "@upstash/redis"

/**
 * 🚀 REDIS CLIENT WITH MOCK FALLBACK
 * Prevents crashes during local development if credentials are missing.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

function createMockRedis() {
  console.warn("⚠️  Upstash Redis credentials missing — using in-memory mock store");
  const store = new Map<string, any>();
  const hstores = new Map<string, Map<string, any>>();
  const sstores = new Map<string, Set<string>>();

  return {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, val: any, options?: any) => {
      store.set(key, val);
      return "OK";
    },
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
    incr: async (key: string) => {
      const val = (store.get(key) || 0) + 1;
      store.set(key, val);
      return val;
    },
    decr: async (key: string) => {
      const val = (store.get(key) || 0) - 1;
      store.set(key, val);
      return val;
    },
    hget: async (key: string, field: string) => {
      return hstores.get(key)?.get(field) ?? null;
    },
    hset: async (key: string, data: Record<string, any>) => {
      if (!hstores.has(key)) hstores.set(key, new Map());
      const h = hstores.get(key)!;
      Object.entries(data).forEach(([f, v]) => h.set(f, v));
      return Object.keys(data).length;
    },
    sadd: async (key: string, val: string) => {
      if (!sstores.has(key)) sstores.set(key, new Set());
      sstores.get(key)!.add(val);
      return 1;
    },
    srem: async (key: string, val: string) => {
      return sstores.get(key)?.delete(val) ? 1 : 0;
    },
    smembers: async (key: string) => {
      return Array.from(sstores.get(key) || []);
    },
    scard: async (key: string) => {
      return sstores.get(key)?.size || 0;
    },
    keys: async (pattern: string) => {
      const p = pattern.replace("*", "");
      return Array.from(store.keys()).filter(k => k.startsWith(p));
    },
    expire: async (key: string, seconds: number) => {
      return 1;
    }
  } as any;
}

export const redis = (url && token) 
  ? new Redis({ url, token }) 
  : createMockRedis();
