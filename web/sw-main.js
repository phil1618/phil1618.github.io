/* eslint-disable no-var */
"use strict";

var CACHE_UNIT_KB = 1024;
var CACHE_UNIT_KB_COUNT = 1000; // 1000 KB = 1 MB by cache unit
var CACHE_MEMORY_TO_MB_CONVERSION_FACTOR = 1 / 1000;
var MAX_CACHE_SIZE_MB = 500;

var client = null;

var HLS_SEGMENT_CACHE_NAME = "sw-hls-segment-cache";
var clientPostMessage = function (message) {
  if (client) {
    client.postMessage(message);
  }
};

self.addEventListener("message", function (event) {
  client = event.source;

  // Special messages handling
  if (event.source && event.data === "Hi service worker, FlowR speaking! do you hear me ?") {
    event.source.postMessage("I hear you FlowR!");

    caches
      .open(HLS_SEGMENT_CACHE_NAME)
      .then(function () {
        clientPostMessage("cache-open-".concat(HLS_SEGMENT_CACHE_NAME));
      });
    //   .then(function () {
    //     return measureCacheSize();
    //   })
    //   .then(function () {
    //     return clearAllCache();
    //   })
    //   .catch(function (error) {
    //     clientPostMessage("cache-error-".concat(HLS_SEGMENT_CACHE_NAME).concat(": ").concat(error));
    //   });
  }
});

self.addEventListener("install", function (event) {
  // Perform install steps
  clientPostMessage("Service Worker installing");
  event.waitUntil(
    caches.open(HLS_SEGMENT_CACHE_NAME).catch(function (error) {
      clientPostMessage("cache-error-".concat(HLS_SEGMENT_CACHE_NAME).concat(": ").concat(error));
    })
  );
  skipWaiting();
});

self.addEventListener("activate", function () {
  clientPostMessage("Service Worker activating");
  return clients.claim();
});

//	Measure cache size
var clearAllCache = function () {
  return caches.keys().then(function (cacheNames) {
    return Promise.all(
      cacheNames
        .filter(function (n) {
          return n === HLS_SEGMENT_CACHE_NAME;
        })
        .map(function (cacheName) {
          return caches.delete(cacheName).catch(function (error) {
            console.error("Failed to delete cache:", error);
          });
        })
    );
  });
};

var addDataToCache = function (cache, dataSize, unitCounter) {
  unitCounter = unitCounter || 0;
  //	Check if we reached the maximum cache size of 100 MB
  if (unitCounter * dataSize * CACHE_MEMORY_TO_MB_CONVERSION_FACTOR >= MAX_CACHE_SIZE_MB) {
    return unitCounter;
  }

  var response = new Response(new Blob([new Array(dataSize * CACHE_UNIT_KB).join("a")], {type: "text/plain"}));
  return cache
    .put("/test-data/".concat(String(unitCounter + 1)), response)
    .then(function () {
      unitCounter++;
      return addDataToCache(cache, dataSize, unitCounter);
    })
    .catch(function () {
      return unitCounter;
    });
};

var measureCacheSize = function () {
  var dataSize = CACHE_UNIT_KB_COUNT;
  void clearAllCache()
    .then(function () {
      return caches.open(HLS_SEGMENT_CACHE_NAME);
    })
    .then(function (cache) {
      return addDataToCache(cache, dataSize);
    })
    .then(function (unitCounter) {
      clientPostMessage("cache-size-".concat(String(Math.round(dataSize * unitCounter * CACHE_MEMORY_TO_MB_CONVERSION_FACTOR))));
    })
    .catch(function (error) {
      console.error("Failed to clear the cache:", error);
    });
};

//  Video cache logic

var shouldCache = function (url) {
  console.log(url, url.endsWith(".ts"));
  return url.endsWith(".ts");
};

var loadFromCacheOrFetch = function (request) {
  if (shouldCache(request.url)) {
    clientPostMessage("Cacheable URL intercepted ".concat(request.url));
  }

  return caches.open(HLS_SEGMENT_CACHE_NAME).then(function (cache) {
    return cache.match(request).then(function (cacheData) {
      if (cacheData) {
        // The custom header was added before putting it in the cache.
        clientPostMessage("Handling cached request ".concat(request.url));
        return cacheData;
      }

      // Request not cached, make a real request for the file.
      return fetch(request)
        .then(function (response) {
          // Cache any successfully request for an MP4 segment.  Service
          // workers cannot cache 206 (Partial Content).  This means that
          // content that uses range requests (e.g. SegmentBase) will require
          // more work.
          if (response.ok && response.status !== 206 && shouldCache(request.url)) {
            clientPostMessage("Caching MP4 segment ".concat(request.url));
            cacheResponse(cache, request, response);
          }
          return response;
        })
        .catch(function (error) {
          clientPostMessage("Error fetching MP4 segment ".concat(request.url, ": ").concat(error));
        });
    });
  });
};

var cacheResponse = function (cache, request, response) {
  var init = {
    status: response.status,
    statusText: response.statusText,
  };
  return response
    .clone()
    .arrayBuffer()
    .then(function (ab) {
      cache.put(request, new Response(ab, init));
    })
    .catch(function (error) {
      clientPostMessage("Error caching MP4 segment ".concat(request.url, ": ").concat(error));
    });
};

self.addEventListener("fetch", function (event) {
  event.respondWith(loadFromCacheOrFetch(event.request));
});
