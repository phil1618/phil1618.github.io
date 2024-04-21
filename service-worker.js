const cacheName = 'video-cache';

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                // If the request is for a video file, handle byte range requests
                if (event.request.url.endsWith('.mp4')) {
                    return handleRangeRequests(event.request);
                }

                // For other requests, fetch from the network
                return fetch(event.request);
            })
    );
});

// Function to handle byte range requests
async function handleRangeRequests(request) {
    const url = new URL(request.url);
    const rangeHeader = request.headers.get('range');
    if (!rangeHeader) {
        // If no range header is present, fetch the entire video
        return fetch(request);
    }

    const cache = await caches.open(cacheName);
    const responseFromCache = await cache.match(request);
    if (responseFromCache) {
        // If the range request can be fulfilled from cache, return the cached response
        return responseFromCache;
    }

    // Parse range header
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : undefined;

    // Fetch the requested byte range from the network
    const response = await fetch(request);
    if (!response.ok) {
        return response;
    }

    // Clone the response for caching
    const responseToCache = response.clone();

    // Cache the requested byte range
    const contentRange = `bytes ${start}-${end}/${response.headers.get('content-length')}`;
    const slicedResponse = new Response(response.body, {
        status: 206,
        statusText: 'Partial Content',
        headers: {
            'Content-Range': contentRange,
            'Content-Length': end ? (end - start + 1) : response.headers.get('content-length'),
            'Content-Type': 'video/mp4'
        }
    });

    // Cache the response
    await cache.put(request, slicedResponse);

    // Return the sliced response
    return slicedResponse;
}