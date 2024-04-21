// Service worker script
const cacheName = 'video-cache';
const chunkSize = 2 * 1024 * 1024; // 1 MB chunk size

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
    if (requestUrl.pathname.endsWith('.mp4')) {
        event.respondWith(handleRangeRequests(event.request));
    }
});

// Function to handle byte range requests for MP4 video files with forced range chunks
async function handleRangeRequests(request) {
    const rangeHeader = request.headers.get('range');
    if (!rangeHeader) {
        // If no range header is present, fetch the entire video
        return fetch(request);
    }

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

    // Cache the response in chunks
    const chunks = [];
    let bytesRemaining = response.headers.get('content-length');
    let offset = 0;

    while (bytesRemaining > 0) {
        const chunkSizeToFetch = Math.min(chunkSize, bytesRemaining);
        const end = offset + chunkSizeToFetch - 1;
        const range = `bytes=${offset}-${end}`;
        const chunkRequest = new Request(request.url, {
            method: 'GET',
            headers: {
                Range: range
            }
        });

        const chunkResponse = await fetch(chunkRequest);
        const chunk = await chunkResponse.arrayBuffer();
        chunks.push(chunk);

        offset += chunkSizeToFetch;
        bytesRemaining -= chunkSizeToFetch;
    }

    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0));
    let offsetConcatenated = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(new Uint8Array(chunk), offsetConcatenated);
        offsetConcatenated += chunk.byteLength;
    }

    const slicedResponse = new Response(concatenatedChunks, {
        status: 206,
        statusText: 'Partial Content',
        headers: {
            'Content-Range': `bytes 0-${concatenatedChunks.byteLength - 1}/${response.headers.get('content-length')}`,
            'Content-Length': concatenatedChunks.byteLength,
            'Content-Type': 'video/mp4'
        }
    });

    // Cache the response
    await cache.put(request, slicedResponse);

    // Return the sliced response to the client
    return slicedResponse;
}