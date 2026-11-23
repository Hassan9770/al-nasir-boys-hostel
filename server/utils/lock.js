// Serialises work per key inside one Node process (used for per-room capacity checks).
const tails = new Map();
export async function withLock(key, fn) {
  const k = String(key);
  const prev = tails.get(k) || Promise.resolve();
  let release;
  const mine = new Promise((r) => (release = r));
  tails.set(k, prev.then(() => mine));
  await prev;
  try { return await fn(); } finally { release(); }
}
