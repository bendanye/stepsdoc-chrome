var lastUrl;
var savedFileEntry, fileDisplayPath;

$(function(){

    chrome.storage.sync.get(['recordingState', 'recording'],function(recorder){
        const recordingState = recorder.recordingState;
        const recording = recorder.recording;

        switch (recordingState) {
            case 'RECORDING':
                $('#recordBtn').prop('value', 'Stop Recording');
                break;
            case 'FINISH':
                $('#recordBtn').prop('value', 'Clear Recording');
                let output = generateRecordingOutput(recording);
                $('#output').val(output);
                break;
            default:
                $('#recordBtn').prop('value', 'Start Recording');
        }
    });

    $('#recordBtn').click(function() {

        chrome.storage.sync.get(['recording', 'recordingState'],function(recorder){

            let recordingState = recorder.recordingState;
            let recording = recorder.recording;
        
            if (recordingState === 'RECORDING') {
                $('#recordBtn').prop('value', 'Clear Recording');
                recordingState = 'FINISH';

                let output = generateRecordingOutput(recording);
                $('#output').val(output);

                //doExportToDisk();

                chrome.browserAction.setIcon({ path: './icon-green.png' });
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {"message": "stop_recording"});
                });
                //chrome.browserAction.setBadgeText({ text: '' })
                chrome.webNavigation.onCommitted.removeListener()
                chrome.runtime.onMessage.removeListener()
                chrome.tabs.onUpdated.removeListener()
            }

            else if (recordingState === 'FINISH') {
                recording = [];
                $('#output').val('');
                recordingState = 'BEGIN';
                $('#recordBtn').prop('value', 'Start Recording');
                chrome.browserAction.setIcon({ path: './icon-black.png' });
            }
        
            else {
                $('#recordBtn').prop('value', 'Stop Recording');
                recordingState = 'RECORDING';

                chrome.browserAction.setIcon({ path: './icon-red.png' });
                // Send a message to the active tab
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {"message": "start_recording"});
                });
                chrome.webNavigation.onCompleted.addListener(handleCompletedNavigation);
                chrome.webNavigation.onCommitted.addListener(handleCommittedNavigation)
                chrome.runtime.onMessage.addListener(handleMessage);
            }

            chrome.storage.sync.set({'recordingState': recordingState, 'recording': recording});
        });
    });
});

function generateRecordingOutput(recording) {
    let output = "";
                
    for(let i in recording) {
        let action = recording[i].action;
        let selector = recording[i].selector;
        let url = recording[i].url;
        let value = recording[i].value;
        output += 'Step ' + (parseInt(i)+1) + ': '
        switch (action) {
            case 'keydown':
                output += `type '${value}' on '${selector}'`
                break
            case 'click':
                output += `click on '${selector}'`
                break
            case 'url':
                output += `.go to '${value}'`
                break
            default:
                output += `unkown action ${action}`
                break
        }
        output += "\n\n";
    }

    return output;
}

function doExportToDisk() {
    if (savedFileEntry) {
      exportToFileEntry(savedFileEntry);
    } else {
      chrome.fileSystem.chooseEntry( {
        type: 'saveFile',
        suggestedName: 'todos.txt',
        accepts: [ { description: 'txt files (*.txt)',
                     extensions: ['txt']} ],
        acceptsAllTypes: true
      }, exportToFileEntry);

    }
}

function exportToFileEntry(fileEntry) {
    savedFileEntry = fileEntry;

    var status = document.getElementById('status');

    // Use this to get a file path appropriate for displaying
    chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
      fileDisplayPath = path;
      status.innerText = 'Exporting to '+path;
    });

    getTodosAsText(function(contents) {

      fileEntry.createWriter(function(fileWriter) {

        var truncated = false;
        var blob = new Blob([contents]);

        fileWriter.onwriteend = function(e) {
          if (!truncated) {
            truncated = true;
            // You need to explicitly set the file size to truncate
            // any content that might have been there before
            this.truncate(blob.size);
            return;
          }
          status.innerText = 'Export to '+ fileDisplayPath +' completed';
        };

        fileWriter.onerror = function(e) {
          status.innerText = 'Export failed: '+e.toString();
        };

        fileWriter.write(blob);

      });
    });
}

function getTodosAsText(callback) {
    chrome.storage.local.get(['recording', 'captured'], function(recorder) {
      let output = generateRecordingOutput(recorder.recording);

      callback(output);

    }.bind(this));
}

function handleCompletedNavigation (details) {
    //alert("handleCompletedNavigation");
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