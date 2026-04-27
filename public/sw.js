const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `streamperf-${CACHE_VERSION}`

const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`
const IMAGE_CACHE = `${CACHE_NAME}-images`

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100

// =====================
// INSTALL EVENT
// =====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )

  // Force activation immediately
  self.skipWaiting()
})

// =====================
// ACTIVATE EVENT
// =====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('streamperf-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )

  // Take control of all pages immediately
  return self.clients.claim()
})

// =====================
// FETCH EVENT
// =====================
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') return

  // Skip streaming video (HLS segments)
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts')) {
    return
  }

  // API requests: Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
    return
  }

  // Images: Cache first, network fallback
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE))
    return
  }

  // Static assets: Cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // HTML pages: Network first, cache fallback, offline page
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      networkFirstStrategy(request, DYNAMIC_CACHE).catch(() => {
        return caches.match('/offline.html')
      })
    )
    return
  }

  // Default: Network first
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// =====================
// BACKGROUND SYNC
// =====================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites())
  }

  if (event.tag === 'sync-metrics') {
    event.waitUntil(syncMetrics())
  }
})

// =====================
// PUSH NOTIFICATIONS
// =====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)

  const data = event.data?.json() || {}
  const title = data.title || 'StreamPerf'
  const options = {
    body: data.body || 'New content available',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/'
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})

// =====================
// STRATEGIES
// =====================

/**
 * Network first, cache fallback
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

/**
 * Cache first, network fallback
 */
async function cacheFirstStrategy(request, cacheName, maxSize) {
  const cached = await caches.match(request)
  
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(cacheName)
      
      // Limit cache size
      if (maxSize) {
        await limitCacheSize(cacheName, maxSize)
      }
      
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    throw error
  }
}

/**
 * Limit cache size
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
  }
}

/**
 * Sync favorites to server
 */
async function syncFavorites() {
  try {
    const favorites = await getStoredFavorites()
    
    await fetch('/api/favorites/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites }),
    })

    console.log('[SW] Favorites synced')
  } catch (error) {
    console.error('[SW] Favorites sync failed:', error)
    throw error
  }
}

/**
 * Sync metrics to server
 */
async function syncMetrics() {
  try {
    const metrics = await getStoredMetrics()
    
    if (metrics.length === 0) return

    await fetch('/api/metrics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics }),
    })

    await clearStoredMetrics()
    console.log('[SW] Metrics synced')
  } catch (error) {
    console.error('[SW] Metrics sync failed:', error)
    throw error
  }
}

/**
 * IndexedDB helpers
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StreamPerfDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains('metrics')) {
        db.createObjectStore('metrics', { autoIncrement: true })
      }
    }
  })
}

async function getStoredFavorites() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['favorites'], 'readonly')
    const store = transaction.objectStore('favorites')
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getStoredMetrics() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics'], 'readonly')
    const store = transaction.objectStore('metrics')
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function clearStoredMetrics() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics'], 'readwrite')
    const store = transaction.objectStore('metrics')
    const request = store.clear()
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
