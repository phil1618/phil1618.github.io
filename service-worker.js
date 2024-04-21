// Service worker script
const cacheName = 'video-cache';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                // No initial caching required
            })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Check if the request is for an HTML video tag and the file type is MP4
    if (requestUrl.pathname.endsWith('.mp4') && event.request.headers.get('range')) {
        event.respondWith(handleRangeRequests(event.request));
    }
});

// Function to handle byte range requests for MP4 video files
async function handleRangeRequests(request) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // If the requested byte range is available in the cache, return it
    if (cachedResponse) {
        return cachedResponse;
    }

    // If not, fetch the requested byte range from the network
    const response = await fetch(request);

    // Clone the response for caching
    const responseToCache = response.clone();

    // Cache the response
    await cache.put(request, responseToCache);

    // Return the original response to the client
    return response;
}