chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "myContextMenu",
        title: "Chọn tôi",
        contexts: ["link", "image"],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "myContextMenu") {
        const url = chrome.runtime.getURL("showme.html");

        // Lưu link hoặc ảnh mà người dùng đã nhấn vào trong chrome.storage.local
        chrome.storage.local.set({ clickedItem: info }, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            console.log("Thông tin liên kết hoặc hình ảnh đã được lưu vào chrome.storage.local: ", info);
        });

        chrome.tabs.create({ url: url });
    }
});
