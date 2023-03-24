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

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "myContextMenu") {
        // Lấy thông tin về đường dẫn của trang showme.html
        const url = chrome.runtime.getURL("showme.html");

        // Tạo một tab mới và chuyển đến trang HTML của tiện ích mở rộng
        chrome.tabs.create({ url: url }, function (tab) {
            // Kiểm tra xem đối tượng chrome.storage đã được khởi tạo chưa
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            // Lưu thông tin về liên kết hoặc hình ảnh mà người dùng đã nhấp vào vào chrome.storage.local
            chrome.storage.local.set({ clickedItem: info });
        });
    }
});





