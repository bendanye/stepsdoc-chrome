chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    handleMessage(request);
  }
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.sync.get(['recordingState'],function(recorder){
    if (recorder.recordingState === 'RECORDING') {
      chrome.tabs.sendMessage(tabId, {"message": "clicked_browser_action"});
    }
  });
});

function handleMessage(message) {
  if (message.action === 'url') {
    lastUrl = message.value
  } else {
    chrome.storage.sync.get(['recording'],function(recorder){
      let recording = recorder.recording;
      recording.push(message);
      chrome.storage.sync.set({'recording': recording});
    });
  }
}