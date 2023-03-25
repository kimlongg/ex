document.getElementById('submit-caption').addEventListener('click', () => {
    const caption = document.getElementById('caption-input').value.trim();
    chrome.runtime.sendMessage({ type: 'CAPTION_INPUT', caption });
});
