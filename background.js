var isRecording = false;
var lastUrl;
var recording = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    handleMessage(request);
  }
);

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function() {

  if (isRecording) {
    chrome.browserAction.setIcon({ path: './icon-black.png' });
    chrome.browserAction.setBadgeText({ text: '' })
	alert("finish:" + recording[0].value);
    //chrome.webNavigation.onCommitted.removeListener()
    //chrome.runtime.onMessage.removeListener()
    //chrome.tabs.onUpdated.removeListener()
  }

  else {
    chrome.browserAction.setIcon({ path: './icon-green.png' });
    chrome.browserAction.setBadgeText({ text: '1' })
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
    //chrome.webNavigation.onCompleted.addListener(handleCompletedNavigation);
    //chrome.webNavigation.onCommitted.addListener(handleCommittedNavigation)
    //chrome.runtime.onMessage.addListener(handleMessage);
  }

  isRecording = !isRecording;
  
});

function handleCompletedNavigation (details) {
  console.log("handleCompletedNavigation");
  if (details.frameId === 0) {
    chrome.tabs.executeScript({ file: 'content.js' })
  }
}

function handleCommittedNavigation (details) {
  console.log("handleCommittedNavigation");
  if (details.transitionQualifiers.includes('from_address_bar') || details.url === lastUrl) {
    handleMessage({ action: 'goto', url })
  }
}

function handleMessage(message) {
  if (message.action === 'url') {
    lastUrl = message.value
  } else {
    recording.push(message)
  }
}