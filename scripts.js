// Gửi yêu cầu lấy thông tin về liên kết hoặc hình ảnh đã nhấp vào từ content script
chrome.runtime.sendMessage("getClickedItem", function (response) {
    if (response) {
        var clickedItemElement;
        if (response.type === "link") {
            clickedItemElement = document.createElement("a");
            clickedItemElement.setAttribute("href", response.url);
            clickedItemElement.innerText = "Đây là link mà bạn đã nhấn: " + response.url;
        } else if (response.type === "image") {
            clickedItemElement = document.createElement("img");
            clickedItemElement.setAttribute("src", response.url);
            clickedItemElement.setAttribute("alt", "Đây là hình ảnh mà bạn đã nhấn");
        }
        document.body.appendChild(clickedItemElement);
    }
});
