// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("content.js - " + request.message)
    if( request.message === "start_recording" ) {
      start();
    } 

    else if( request.message === "stop_recording" ) {
      stop();
    } 
  }
);