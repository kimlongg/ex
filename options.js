const resultDiv = document.getElementById("result");
const tokenInput = document.getElementById("token-input");

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



  