// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("content.js - onMessage")
    if( request.message === "clicked_browser_action" ) {
      start();
    }
  }
);