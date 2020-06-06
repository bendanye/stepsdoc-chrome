chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    handleMessage(request);
  }
);

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