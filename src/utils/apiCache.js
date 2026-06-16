const cacheStore = new Map();

/**
 * Sets a value in the cache with a specified TTL.
 * @param {string} key
 * @param {any} data
 * @param {number} ttl milliseconds
 */
export const setCache = (key, data, ttl = 30000) => {
  const expiry = Date.now() + ttl;
  cacheStore.set(key, { data, expiry });
};

/**
 * Synchronously retrieves a fresh cache entry if it exists.
 * @param {string} key
 * @returns {any | null} The cached data or null if not found or expired.
 */
export const getCacheSync = (key) => {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return cached.data;
};

/**
 * Checks the cache first. If hit, returns a resolved promise.
 * If miss, fetches and stores the promise/result in the cache.
 * Deduplicates overlapping parallel fetches for the same key.
 * @param {string} key
 * @param {function} fetchFn Returns a Promise resolving to API response
 * @param {number} ttl milliseconds
 */
export const withCache = (key, fetchFn, ttl = 30000) => {
  const cachedData = getCacheSync(key);
  if (cachedData !== null) {
    return Promise.resolve(cachedData);
  }

  const promiseKey = `promise_${key}`;
  if (cacheStore.has(promiseKey)) {
    return cacheStore.get(promiseKey).promise;
  }

  const promise = fetchFn()
    .then((res) => {
      setCache(key, res, ttl);
      cacheStore.delete(promiseKey);
      return res;
    })
    .catch((err) => {
      cacheStore.delete(promiseKey);
      throw err;
    });

  cacheStore.set(promiseKey, { promise });
  return promise;
};

/**
 * Clears all cache entries.
 */
export const clearCache = () => {
  cacheStore.clear();
};
