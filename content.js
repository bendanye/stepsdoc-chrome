// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("onMessage")
    if( request.message === "clicked_browser_action" ) {
      start();
    }
  }
);

function start() {
  const typeableElements = document.querySelectorAll('input, textarea');
  const clickableElements = document.querySelectorAll('a, button');

  for (let i = 0; i < typeableElements.length; i++) {
    console.log("typeableElements");
    typeableElements[i].addEventListener('keydown', handleKeydown)
  }

  for (let i = 0; i < clickableElements.length; i++) {
    console.log("clickableElements");
    clickableElements[i].addEventListener('click', handleClick)
  }
}
    
function handleKeydown(e) {
  if (e.keyCode !== 9) {
    return
  }
  sendMessage(e);
}

function handleClick(e) {
	console.log("handleClick");
  if (e.target.href) {
    chrome.runtime.sendMessage({
      action: 'url',
      value: e.target.href
    })
  }
  sendMessage(e);
}

function sendMessage (e) {
  chrome.runtime.sendMessage({
    value: e.target.value,
    action: e.type
  })
}