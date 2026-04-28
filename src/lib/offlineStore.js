const STORE_NAMES = [
  "trips",
  "days",
  "itineraryItems",
  "places",
  "lodgings",
  "transportSegments",
  "links",
  "phrases",
  "assets",
  "weatherSnapshots"
];

export function createMemoryStore(seed = {}) {
  const buckets = new Map();
  for (const name of STORE_NAMES) {
    buckets.set(name, new Map((seed[name] ?? []).map((record) => [record.id, record])));
  }

  return {
    async put(storeName, record) {
      const bucket = getBucket(buckets, storeName);
      const next = { ...record, updatedAt: record.updatedAt ?? new Date().toISOString() };
      bucket.set(next.id, next);
      return next;
    },
    async get(storeName, id) {
      return getBucket(buckets, storeName).get(id) ?? null;
    },
    async list(storeName) {
      return Array.from(getBucket(buckets, storeName).values());
    },
    async listByTrip(storeName, tripId) {
      return Array.from(getBucket(buckets, storeName).values()).filter((record) => record.tripId === tripId);
    },
    async remove(storeName, id) {
      return getBucket(buckets, storeName).delete(id);
    }
  };
}

export function createIndexedDbStore(dbName = "short-trip-command", version = 1) {
  if (typeof indexedDB === "undefined") {
    return createMemoryStore();
  }

  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: "id" });
          store.createIndex("tripId", "tripId", { unique: false });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return {
    async put(storeName, record) {
      const next = { ...record, updatedAt: record.updatedAt ?? new Date().toISOString() };
      await writeTransaction(dbPromise, storeName, "readwrite", (store) => store.put(next));
      return next;
    },
    async get(storeName, id) {
      return readTransaction(dbPromise, storeName, (store) => store.get(id));
    },
    async list(storeName) {
      return readTransaction(dbPromise, storeName, (store) => store.getAll());
    },
    async listByTrip(storeName, tripId) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const index = transaction.objectStore(storeName).index("tripId");
        const request = index.getAll(tripId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async remove(storeName, id) {
      await writeTransaction(dbPromise, storeName, "readwrite", (store) => store.delete(id));
      return true;
    }
  };
}

function getBucket(buckets, storeName) {
  if (!buckets.has(storeName)) buckets.set(storeName, new Map());
  return buckets.get(storeName);
}

async function readTransaction(dbPromise, storeName, operation) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeTransaction(dbPromise, storeName, mode, operation) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
