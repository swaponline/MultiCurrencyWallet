chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        'url': chrome.extension.getURL('/application/index.html')
    }, (tab) =>{
      // fallback
    });
});
