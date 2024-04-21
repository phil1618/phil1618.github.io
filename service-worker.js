// Service worker script
const cacheName = 'video-cache';
const chunkSize = 1 * 1024 * 1024; // 1 MB chunk size

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                // No initial caching required
            })
    );
});

// self.addEventListener('fetch', event => {
//     const requestUrl = new URL(event.request.url);
//     console.log(`Handling fetch event for: ${requestUrl.pathname}`);
//     // Check if the request is for an HTML video tag and the file type is MP4
//     if (requestUrl.pathname.endsWith('.mp4')) {
//         event.respondWith(handleRangeRequests(event.request));
//     }
// });

// // Function to handle byte range requests for MP4 video files with forced range chunks
// async function handleRangeRequests(request) {
//     console.log(`Handling range request for: ${request.url}`);
//     const rangeHeader = request.headers.get('range');
//     console.log(`Range header: ${rangeHeader}`);
//     if (!rangeHeader) {
//         // If no range header is present, fetch the entire video
//         return fetch(request);
//     }

//     const cache = await caches.open(cacheName);
//     const cachedResponse = await cache.match(request);

//     // If the requested byte range is available in the cache, return it
//     if (cachedResponse) {
//         return cachedResponse;
//     }

//     // If not, fetch the requested byte range from the network
//     const response = await fetch(request);

//     // Clone the response for caching
//     const responseToCache = response.clone();

//     // Cache the response in chunks
//     const chunks = [];
//     let bytesRemaining = response.headers.get('content-length');
//     let offset = 0;

//     console.log('Caching response in chunks', bytesRemaining);

//     while (bytesRemaining > 0) {
//         console.log('Bytes remaining:', bytesRemaining);
//         const chunkSizeToFetch = Math.min(chunkSize, bytesRemaining);
//         const end = offset + chunkSizeToFetch - 1;
//         const range = `bytes=${offset}-${end}`;
//         console.log(`Fetching range: ${range}`);
//         const chunkRequest = new Request(request.url, {
//             method: 'GET',
//             headers: {
//                 Range: range
//             }
//         });

//         const chunkResponse = await fetch(chunkRequest);
//         const chunk = await chunkResponse.arrayBuffer();
//         chunks.push(chunk);

//         offset += chunkSizeToFetch;
//         bytesRemaining -= chunkSizeToFetch;
//     }

//     const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0));
//     let offsetConcatenated = 0;
//     for (const chunk of chunks) {
//         concatenatedChunks.set(new Uint8Array(chunk), offsetConcatenated);
//         offsetConcatenated += chunk.byteLength;
//     }

//     const slicedResponse = new Response(concatenatedChunks, {
//         status: 206,
//         statusText: 'Partial Content',
//         headers: {
//             'Content-Range': `bytes 0-${concatenatedChunks.byteLength - 1}/${response.headers.get('content-length')}`,
//             'Content-Length': concatenatedChunks.byteLength,
//             'Content-Type': 'video/mp4'
//         }
//     });

//     // Cache the response
//     console.log('Caching response');
//     await cache.put(request, slicedResponse);

//     // Return the sliced response to the client
//     return slicedResponse;
// }