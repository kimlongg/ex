const submitButton = document.getElementById('submit');
const cancelButton = document.getElementById('cancel');
const captionInput = document.getElementById('caption');
const imageUrlLink = document.getElementById('image-url-link');

submitButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        type: 'captionSubmit',
        caption: captionInput.value.trim(),
        imageUrl: window.imageUrl,
    });
});

cancelButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'captionCancel' });
});

// Set the href attribute of the image URL link when the image URL is received
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'imageUrl') {
        imageUrlLink.href = request.imageUrl;
        imageUrlLink.textContent = 'Link hình ảnh';
    }
});