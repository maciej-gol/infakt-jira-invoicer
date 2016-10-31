chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create(
        {'url': chrome.extension.getURL('new_invoice.html')},
        (function() {})
    );
});