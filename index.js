function injectHeadJS() {
  var iFrameHead = document.getElementById("iframe-1").contentWindow.document.getElementsByTagName("head")[0];
  var kbScript = document.createElement("script");
  kbScript.type = "text/javascript";
  kbScript.src = "dist/kioskboard-aio-2.3.0.min.js";
  iFrameHead.appendChild(kbScript);

  injectBodyJS()
}

function injectBodyJS() {
  var iFrameHead = document.getElementById("iframe-1").contentWindow.document.getElementsByTagName("body")[0];
  var kbScript = document.createElement("script");
  kbScript.type = "text/javascript";
  kbScript.src = "iframe-kb-setup.js";
  iFrameHead.appendChild(kbScript);
}