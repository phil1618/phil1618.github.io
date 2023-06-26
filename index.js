function injectHeadJS() {

  var frames = window.frames; // ou // var frames = window.parent.frames;
for (var i = 0; i < frames.length; i++) {
  // faire quelque chose avec chaque subframe en tant que frames[i]
  console.log(frames[i])
}

  var iFrameHead = window.frames["iframe-1"].document.getElementsByTagName("head")[0];
  var kbScript = document.createElement("script");
  kbScript.type = "text/javascript";
  kbScript.src = "dist/kioskboard-aio-2.3.0.min.js";
  iFrameHead.appendChild(kbScript);

  injectBodyJS()
}

function injectBodyJS() {
  var iFrameHead = window.frames["iframe-1"].document.getElementsByTagName("body")[0];
  var kbScript = document.createElement("script");
  kbScript.type = "text/javascript";
  kbScript.src = "iframe-kb-setup.js";
  iFrameHead.appendChild(kbScript);
}