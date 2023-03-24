chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "startEx") {
        // Tạo một tab mới và chuyển đến trang HTML của tiện ích mở rộng
        chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
});
