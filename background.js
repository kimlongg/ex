chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js'],
    });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "myContextMenu",
        title: "Chọn tôi",
        contexts: ["link", "image"]
    });
});


async function handleContextMenuClick(info, tab) {
    const url = info.srcUrl || info.linkUrl;
    const type = info.srcUrl ? 'image' : 'link';

    // Chèn content_script.js vào trang web hiện tại với các biến url và type
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js']
    });

    // Gửi thông điệp đến content_script.js với url và type
    chrome.tabs.sendMessage(tab.id, { url, type });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "startEx") {
        // Tạo một tab mới và chuyển đến trang HTML của tiện ích mở rộng
        chrome.tabs.create({ url: chrome.runtime.getURL("yourpage.html") });
    }
});



