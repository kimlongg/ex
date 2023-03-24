chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "getClickedItem") {
        chrome.storage.local.get("clickedItem", function (data) {
            sendResponse(data.clickedItem);
        });
    }
    return true;
});
