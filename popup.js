var lastUrl;

$(function(){

    chrome.storage.sync.get(['recordingState'],function(recorder){
        let recordingState = recorder.recordingState;

        if (recordingState) {
            $('#recordBtn').prop('value', 'Stop Recording');
        }

        else {
            $('#recordBtn').prop('value', 'Start Recording');
        }
    });

    $('#recordBtn').click(function() {

        chrome.storage.sync.get(['recording', 'recordingState'],function(recorder){

            var recordingState = recorder.recordingState;
            var recording = recorder.recording;
        
            if (recordingState) {
                $('#recordBtn').prop('value', 'Start Recording');

                let output = "";
                
                for(let i in recording) {
                    output += recording[i].selector + ":" + recording[i].action + "-" + recording[i].value + "\n";
                }

                $('#output').val(output);
                chrome.browserAction.setIcon({ path: './icon-black.png' });
                chrome.browserAction.setBadgeText({ text: '' })
                chrome.webNavigation.onCommitted.removeListener()
                chrome.runtime.onMessage.removeListener()
                chrome.tabs.onUpdated.removeListener()
            }
        
            else {
                $('#recordBtn').prop('value', 'Stop Recording');
                chrome.browserAction.setIcon({ path: './icon-green.png' });
                chrome.browserAction.setBadgeText({ text: '1' })
                // Send a message to the active tab
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
                });
                chrome.webNavigation.onCompleted.addListener(handleCompletedNavigation);
                chrome.webNavigation.onCommitted.addListener(handleCommittedNavigation)
                chrome.runtime.onMessage.addListener(handleMessage);
            }

            chrome.storage.sync.set({'recordingState': !recordingState, 'recording': recording});
        });
    });
});

function handleCompletedNavigation (details) {
    console.log("handleCompletedNavigation");
    if (details.frameId === 0) {
        chrome.tabs.executeScript({ file: 'content-script.js' })
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
        chrome.storage.sync.get(['recording'],function(recorder){
            var recording = recorder.recording;
            recording.push(message);
            chrome.storage.sync.set({'recording': recording});
        });
    }
}