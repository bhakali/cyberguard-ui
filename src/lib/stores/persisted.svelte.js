// Generic localStorage-backed reactive list, mirroring the save/load pattern in cyberguard.svelte.js
export class PersistedList {
  items = $state([]);
  #key;

  constructor(key, seed) {
    this.#key = key;
    this.items = structuredClone(seed);
  }

  init() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.#key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.items = parsed;
      }
    } catch (e) {
      console.warn(`Could not load ${this.#key}`, e);
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.#key, JSON.stringify(this.items));
    } catch (e) {
      console.warn(`Could not save ${this.#key}`, e);
    }
  }

  add(item) {
    this.items.unshift(item);
    this.save();
  }

  update(id, patch) {
    const found = this.items.find((i) => i.id === id);
    if (found) Object.assign(found, patch);
    this.save();
    return found;
  }

  remove(id) {
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    this.save();
    return this.items.length < initialLen;
  }
}

// Generic localStorage-backed reactive single record, for config-style
// objects (as opposed to PersistedList's array-of-items shape).
export class PersistedRecord {
  value = $state({});
  #key;

  constructor(key, seed) {
    this.#key = key;
    this.value = structuredClone(seed);
  }

  init() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.#key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') Object.assign(this.value, parsed);
      }
    } catch (e) {
      console.warn(`Could not load ${this.#key}`, e);
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.#key, JSON.stringify(this.value));
    } catch (e) {
      console.warn(`Could not save ${this.#key}`, e);
    }
  }

  update(patch) {
    Object.assign(this.value, patch);
    this.save();
  }
}
