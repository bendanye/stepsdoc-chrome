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
    console.log("handleKeydown-" + e);
    if (e.keyCode !== 9 || e.keyCode !== 13) {
      return
    }
    sendMessage(e);
  }
  
  function handleClick(e) {
    console.log("handleClick-" + e);
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
      selector: $(e.target).ellocate().xpath,  
      value: e.target.value,
      action: e.type
    })
  }