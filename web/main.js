"use strict";

/**
 * Displays logging information on the screen and in the console.
 * @param {string} msg - Message to log.
 */
function log() {
  var str = [].slice.call(arguments).join(" ");

  try {
    var log = document.getElementById("logs");
    var el = document.createElement("p");
    el.setAttribute("style", "word-break: break-all;white-space: normal;");

    el.innerHTML = str;
    if (log.children.length >= 40) {
      log.removeChild(log.firstChild);
    }
    log.appendChild(el);
  } catch (err) {
    //
  }
}

function registerServiceWorker() {
  log(Date.now(), " Attempting to register Service Worker...");
  if (navigator.serviceWorker) {
    log("Service Worker API is available");

    void navigator.serviceWorker
      .register("/web/sw-main.js")
      .then(function (registered) {
        log("Service Worker registration successful: ", registered);
      })
      .catch(function (error) {
        log("Service Worker registration failed:", error);
      });

    void navigator.serviceWorker.ready.then(function (registration) {
      if (registration && registration.active) {
        registration.active.postMessage(`Hi service worker, FlowR speaking! do you hear me ?`);
      }
    });

    navigator.serviceWorker.addEventListener("message", function (event) {
      log(`SW says: `, event.data);
    });
  } else {
    log("Service Worker API is NOT available");
  }
}

window.onload = function () {
  log(Date.now() + " Page onload");
  setTimeout(function () {
    registerServiceWorker();
  }, 3000);
};
