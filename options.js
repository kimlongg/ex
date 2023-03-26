const resultDiv = document.getElementById("result");
const tokenInput = document.getElementById("token-input");
let token;
const urlParams = new URLSearchParams(window.location.search);
// // Lấy giá trị caption và imageUrl từ local storage của extension
document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.type === 'CAPTION_IMAGE_DATA') {
            const { caption, imageUrl } = request;
            // Lưu giá trị caption và imageUrl vào local storage
            chrome.storage.local.set({ caption, imageUrl });
            // Cập nhật hiển thị giá trị caption và imageUrl
            document.getElementById('caption-input').value = caption;
            document.getElementById('image-link-input').value = imageUrl;

            // Lấy giá trị được tô đen trên trang web
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.executeScript(tabs[0].id, { code: "window.getSelection().toString();" }, function (selection) {
                    if (selection && selection[0]) {
                        // Nếu có giá trị được tô đen thì hiển thị lên ô input image-link
                        document.getElementById('image-link-input').value = selection[0];
                    }
                });
            });
        }
    });
});





chrome.storage.sync.get(['facebookToken'], ({ facebookToken }) => {
    token = facebookToken;
});


function checkFacebookToken(token) {
    const url = `https://graph.facebook.com/v11.0/me/accounts?access_token=${token}`;
    return fetch(url).then((res) => res.json());
}

// Display saved token
chrome.storage.sync.get(["facebookToken"], ({ facebookToken }) => {
    if (facebookToken) {
        tokenInput.value = facebookToken;
    }
});

// Save token on button click
document.getElementById("save-token").addEventListener("click", () => {
    const token = tokenInput.value.trim();
    if (token) {
        // Check if token is valid
        checkFacebookToken(token)
            .then((data) => {
                if (data && data.data) {
                    // Save token to storage
                    chrome.storage.sync.set({ facebookToken: token }, () => {
                        resultDiv.innerText = "Đã lưu token.";
                    });
                } else {
                    resultDiv.innerText = "Token không hợp lệ.";
                }
            })
            .catch((error) => {
                console.error(error);
                resultDiv.innerText = "Lỗi xảy ra khi kiểm tra token.";
            });
    } else {
        resultDiv.innerText = "Vui lòng nhập token Facebook.";
    }
});

// Reset token on button click
document.getElementById("reset-token").addEventListener("click", () => {
    chrome.storage.sync.remove("facebookToken", () => {
        resultDiv.innerText = "Đã xóa token.";
        tokenInput.value = "";
    });
});


// Đăng bài
// popup.js

let pageSelect = document.getElementById('page-select');
let captionInput = document.getElementById('caption-input');
let postButton = document.getElementById('post-button');


chrome.storage.sync.get(['facebookToken'], ({ facebookToken }) => {
    fetch(`https://graph.facebook.com/v13.0/me/accounts?access_token=${facebookToken}`)
        .then(response => response.json())
        .then(data => {
            // Add each page as an option in the select element
            for (let page of data.data) {
                let option = document.createElement('option');
                option.value = page.id;
                option.textContent = page.name;
                pageSelect.appendChild(option);
            }
        })
        .catch(error => {
            alert('Token hết hạn.');
        });
});

const imageLinkInput = document.getElementById('image-link-input');

document.addEventListener('click', event => {
    if (event.target.tagName === 'IMG') {
        const imageUrl = event.target.src;
        imageLinkInput.value = imageUrl;
    }
});

postButton.addEventListener('click', () => {
    let pageId = pageSelect.value;
    let caption = captionInput.value;
    let imageUrl = imageLinkInput.value;

    if (pageId && caption) {
        // Get page access token from Facebook API
        fetch(`https://graph.facebook.com/v13.0/${pageId}?fields=access_token&access_token=${token}`)
            .then(response => response.json())
            .then(data => {
                let pageAccessToken = data.access_token;
                // Post to page using page access token
                let body = {
                    message: caption,
                    access_token: pageAccessToken
                };
                if (imageUrl) {
                    body.url = imageUrl;
                }
                fetch(`https://graph.facebook.com/v13.0/${pageId}/feed`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                })
                    .then(() => {
                        alert('Đăng bài thành công');
                    })
                    .catch(error => {
                        console.error(error);
                        alert('Đã xảy ra lỗi khi đăng bài');
                    });
            })
            .catch(error => {
                console.error(error);
                alert('Đã xảy ra lỗi khi lấy token trang');
            });
    } else {
        alert('Vui lòng nhập nội dung và chọn trang để đăng bài');
    }
});
