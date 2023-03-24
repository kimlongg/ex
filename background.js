// Lưu thông tin về đối tượng tab
let currentTab;

// Hàm để mở tab mới chứa trang showme.html
function openShowMePage(item) {
    // Lấy thông tin về đường dẫn của trang showme.html
    const url = chrome.runtime.getURL("showme.html");

    // Tạo một tab mới và chuyển đến trang showme.html
    chrome.tabs.create({ url: url }, function (tab) {
        currentTab = tab;

        // Gửi message tới content script để yêu cầu lấy đường dẫn của item
        chrome.tabs.sendMessage(currentTab.id, { item });
    });
}

// Lắng nghe sự kiện người dùng click vào menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "myContextMenu") {
        // Lưu thông tin về item mà người dùng đã click vào storage
        chrome.storage.local.set({ clickedItem: info }, function () {
            console.log("Thông tin liên kết hoặc hình ảnh đã được lưu vào chrome.storage.local: ", info);

            // Kiểm tra xem đối tượng tab đã được khởi tạo chưa
            if (!currentTab) {
                // Nếu chưa thì mở tab mới chứa trang showme.html
                openShowMePage(info);
            } else {
                // Nếu đã khởi tạo thì gửi message tới content script để yêu cầu lấy đường dẫn của item
                chrome.tabs.sendMessage(currentTab.id, { item: info });
            }
        });
    }
});

// Lắng nghe sự kiện nhấn vào icon của extension
chrome.action.onClicked.addListener((tab) => {
    // Lưu thông tin về tab hiện tại vào storage
    chrome.storage.local.set({ currentTabId: tab.id }, function () {
        console.log("Thông tin tab hiện tại đã được lưu vào chrome.storage.local: ", tab);
    });

    // Mở tab mới chứa trang showme.html
    chrome.tabs.create({
        url: chrome.runtime.getURL("showme.html"),
    });
});
