async function checkFacebookToken(token) {
    const response = await fetch(`https://graph.facebook.com/me/accounts?access_token=${token}`);
    if (!response.ok) {
        throw new Error("Token lỗi");
    }
    return response.json();
}
document.addEventListener("DOMContentLoaded", () => {
    const resultDiv = document.getElementById("result");

    // Remove facebookToken if it exists
    chrome.storage.sync.get(["facebookToken"], ({ facebookToken }) => {
        if (facebookToken) {
            chrome.storage.sync.remove("facebookToken", () => {
                console.log("Removed facebookToken");
            });
        }
    });

    // Display pages and groups if token exists
    chrome.storage.sync.get(["facebookToken"], async ({ facebookToken }) => {
        if (!facebookToken) {
            resultDiv.innerHTML = "Vui lòng nhập token Facebook trong trang cài đặt.";
            return;
        }

        const data = await checkFacebookToken(facebookToken);
        if (data && data.data) {
            const items = data.data.map((item) => `<li>${item.name}</li>`).join("");
            resultDiv.innerHTML = `<ul>${items}</ul>`;
        } else {
            resultDiv.innerHTML = "Không tìm thấy trang hoặc nhóm nào.";
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        // Đoạn mã JavaScript của bạn ở đây
        const resetButton = document.getElementById("reset-button");
        resetButton.addEventListener("click", () => {
            chrome.storage.sync.remove("facebookToken", () => {
                tokenInput.value = "";
                resultDiv.innerHTML = "Đã xóa Facebook Token.";
            });
        });
    });

});

