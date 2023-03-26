const resultDiv = document.getElementById("result");
const tokenInput = document.getElementById("token-input");
let token;
const urlParams = new URLSearchParams(window.location.search);

// Hàm để nhận nội dung được chọn từ background.js
// Trong options.js
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     if (message.selectedCaption && message.selectedImageUrl) {
//         // Lấy phần tử input và gán giá trị link ảnh
//         const captionInput = document.querySelector('#caption-input');
//         const imageInput = document.querySelector('#image-link-input');
//         captionInput.value = message.selectedCaption;
//         imageInput.value = message.selectedImageUrl;
//     }
// });

chrome.runtime.onMessage.addListener((message) => {
    if (message.selectedText) {
        document.getElementById('caption-input').value = message.selectedText;
    }
    if (message.selectedImageUrl) {
        document.getElementById('image-link-input').value = message.selectedImageUrl;
    }
});

// chrome.runtime.onMessage.addListener((message) => {
//     // console.log(message.selectedImageUrl);
//     if (message.selectedImageUrl) {
//         document.getElementById('image-link-input').value = message.selectedImageUrl;
//         console.log(message.selectedImageUrl);
//     }
// });




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
    const imageUrl = imageLinkInput.value;
    if (imageUrl) {
        try {
            new URL(imageUrl);
        } catch (e) {
            console.error('Invalid image URL:', imageUrl);
            return;
        }
    }

    if (pageId && caption) {
        fetch(`https://graph.facebook.com/v13.0/${pageId}?fields=access_token&access_token=${token}`)
            .then(response => response.json())
            .then(data => {
                let pageAccessToken = data.access_token;

                let body = {
                    message: caption,
                    access_token: pageAccessToken,
                };

                if (imageUrl) {
                    body.url = imageUrl;

                    fetch(`https://graph.facebook.com/v13.0/me/photos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    })
                        .then(() => {
                            alert('Đăng bài thành công');
                        })
                        .catch((error) => {
                            console.error(error);
                            alert('Đã xảy ra lỗi khi đăng bài');
                        });
                } else {
                    fetch(`https://graph.facebook.com/v13.0/${pageId}/feed`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    })
                        .then(() => {
                            alert('Đăng bài thành công');
                        })
                        .catch((error) => {
                            console.error(error);
                            alert('Đã xảy ra lỗi khi đăng bài');
                        });
                }

            })
            .catch((error) => {
                console.error(error);
                alert('Đã xảy ra lỗi khi lấy token trang');
            });
    } else {
        alert('Vui lòng nhập nội dung và chọn trang để đăng bài');
    }
});


