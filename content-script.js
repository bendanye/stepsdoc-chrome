  function start() {
    const typeableElements = document.querySelectorAll('input, textarea');
    const clickableElements = document.querySelectorAll('a, button');

    window.addEventListener('click', handleClick, true)
  
    for (let i = 0; i < typeableElements.length; i++) {

      //console.log("typeableElements: " + typeableElements[i]);
      
      if (isTextBox(typeableElements[i])) {
        console.log("typeableElements with key: " + typeableElements[i]);
        typeableElements[i].addEventListener('keydown', handleKeydown)
        
      }

      /*
      else {
        console.log("typeableElements with click: " + typeableElements[i].eventListenerList);
        typeableElements[i].addEventListener('click', handleClick, false);
        //typeableElements[i].addEventListener('submit', handleClick, false);
      }
      */
    }
  
    /*
    for (let i = 0; i < clickableElements.length; i++) {
      console.log("clickableElements");
      clickableElements[i].addEventListener('click', handleClick)
    } */
  }

  function isTextBox(element) {
      var tagName = element.tagName.toLowerCase();
      if (tagName === 'textarea') return true;
      if (tagName !== 'input') return false;
      var type = element.getAttribute('type').toLowerCase(),
          // if any of these input types is not supported by a browser, it will behave as input type text.
          inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
      return inputTypes.indexOf(type) >= 0;
  }
      
  function handleKeydown(e) {
    console.log("handleKeydown-" + e.keyCode);
    if (e.keyCode !== 9 && e.keyCode !== 13) {
      return
    }

    e.srcElement.setAttribute("style", "border:6px ridge #F7730E;");
    sendMessage(e);
  }
  
  function handleClick(e) {
    console.log("handleClick-" + e);
    
    if (e.target.href) {
      e.srcElement.setAttribute("style", "border:6px ridge #F7730E;");
      //captureScreenshot();
      chrome.runtime.sendMessage({
        action: 'url',
        value: e.target.href
      })
    } 

    else if (e.target.tagName === 'INPUT') {
      e.srcElement.setAttribute("style", "border:6px ridge #F7730E;");
      //captureScreenshot();
      sendMessage(e);
    } 
  }
  
  function sendMessage (e) {
    chrome.runtime.sendMessage({
      selector: $(e.target).ellocate().xpath,  
      value: e.target.value,
      action: e.type
    })
  }

  function captureScreenshot() {
    chrome.tabs.captureVisibleTab({format:"png"}, src=>{
      chrome.storage.local.get({"captured": []}, s=>{
          s.captured.push(src);
          chrome.storage.local.set({"captured": s.captured});
      });
    });
  }

  function stop() {
    const typeableElements = document.querySelectorAll('input, textarea');
    const clickableElements = document.querySelectorAll('a, button');

    window.removeEventListener('click', handleClick, true)
  
    for (let i = 0; i < typeableElements.length; i++) {

      console.log("rm typeableElements: " + typeableElements[i]);
      
      if (isTextBox(typeableElements[i])) {
        typeableElements[i].removeEventListener('keydown', handleKeydown, true)
        
      }

      /*
      else {
        console.log("typeableElements with click: " + typeableElements[i].eventListenerList);
        typeableElements[i].addEventListener('click', handleClick, false);
        //typeableElements[i].addEventListener('submit', handleClick, false);
      }
      */
    }
  
    /*
    for (let i = 0; i < clickableElements.length; i++) {
      console.log("clickableElements");
      clickableElements[i].addEventListener('click', handleClick)
    } */
  }