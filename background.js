const WEBHOOK_URL = "https://discord.com/api/webhooks/1087454967935271083/rOAk8t9Bxwv1Bd9NrlGxZGj4-bP0xniEpmXrwzn9IYk0IVV-J62cBhIsFmq2jsDgygsy";

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "selectContent",
    title: "Chọn thôi",
    contexts: ["image", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "selectContent") {
    if (info.selectionText) {
      sendMessageToDiscord(info.selectionText);
    } else if (info.srcUrl) {
      displayPrompt(tab.id, "Caption/Ghi chú", "", (caption) => {
        if (caption !== null) {
          sendImageToDiscord(info.srcUrl, caption);
        }
      });
    }
  }
});

function displayPrompt(tabId, promptText, defaultValue, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      function: (promptText, defaultValue) => {
        return prompt(promptText, defaultValue);
      },
      args: [promptText, defaultValue],
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else if (results && results.length > 0) {
        callback(results[0].result);
      }
    }
  );
}

async function sendMessageToDiscord(message) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

async function sendImageToDiscord(imageUrl, caption) {
  try {
    const imageBlob = await fetch(imageUrl, { mode: "cors" }).then((r) => r.blob());
    const formData = new FormData();

    // Loại bỏ các đuôi không cần thiết sau đuôi hình ảnh
    const fileName = imageUrl
      .substring(imageUrl.lastIndexOf("/") + 1)
      .replace(/(\.jpg|\.jpeg|\.png|\.gif|\.webp)(\?.*)?$/i, "$1");

    formData.append("file", imageBlob, fileName);
    formData.append(
      "payload_json",
      JSON.stringify({
        content: caption,
      })
    );

    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Error sending image to Discord:", error);
  }
}




