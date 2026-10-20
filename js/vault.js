// Opens sealed story locks in the browser and remembers which ones the player has opened.
(() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const STORE = "flutternet.keys";

  const normalize = (s) => String(s || "").trim().toLowerCase().replace(/^the\s+/, "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

  const keyCache = {};
  async function derive(secret, saltB64) {
    const id = secret + "|" + saltB64;
    if (keyCache[id]) return keyCache[id];
    const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
    return (keyCache[id] = crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: unb64(saltB64), iterations: window.SEAL_ITER, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]));
  }

  // Try a raw secret against every box of a lock; resolves to the payload or null.
  async function openRaw(id, secret) {
    const lock = window.SEALED?.[id];
    if (!lock || !secret) return null;
    const key = await derive(secret, lock.salt);
    for (const box of lock.boxes) {
      try {
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, key, unb64(box.ct));
        return JSON.parse(dec.decode(pt));
      } catch { /* wrong key for this box */ }
    }
    return null;
  }

  const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
  const write = (k) => { try { localStorage.setItem(STORE, JSON.stringify(k)); } catch { /* private mode: progress lasts this visit */ } };
  let mem = read();

  window.Vault = {
    normalize,
    keys: () => ({ ...mem }),
    has: (id) => id in mem,
    // answer is player text; returns payload (and remembers the key) or null
    async open(id, answer, raw = false) {
      const secret = raw ? answer : normalize(answer);
      const payload = await openRaw(id, secret);
      if (payload) { mem[id] = secret; write(mem); }
      return payload;
    },
    async reopen(id) { return id in mem ? openRaw(id, mem[id]) : null; },
    set(id, v) { mem[id] = v; write(mem); },
    reset() { mem = {}; write(mem); },
  };
})();
