const cache = new Map();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function set(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_DURATION
  });
}

function get(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

module.exports = { get, set };

