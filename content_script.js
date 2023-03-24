chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { url, type } = message;

    if (type === 'image') {
        alert(`Đây là hình ảnh với URL: ${url}`);
    } else if (type === 'link') {
        alert(`Đây là đường dẫn với URL: ${url}`);
    }
});
