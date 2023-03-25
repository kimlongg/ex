const WEBHOOKS = [
  { name: 'Sản phẩm', url: 'https://discord.com/api/webhooks/1089125738139107460/p67mRdvA--t8meWSj8PiZ9pZxcJOsseVmcU2SqHC69Utb3tM6Oi9DoDBhVndH-BhxYAh' },
  { name: 'Hai Từ', url: 'https://discord.com/api/webhooks/1089125987708588062/t1i7F_MYtyq5Zpyr3Pn2iOTh4BZhKrFnaJYsNlACAE2zEo8iMpBgcSZSGDtWfX9U_wlQ' },
];

chrome.runtime.onInstalled.addListener(() => {
  // Create main context menu
  chrome.contextMenus.create({
    id: 'sendToDiscord',
    title: 'Chọn tôi',
    contexts: ['selection', 'image'],
  });

  // Create sub context menus for each webhook
  for (let i = 0; i < WEBHOOKS.length; i++) {
    chrome.contextMenus.create({
      id: `sendToDiscord-${i}`,
      title: WEBHOOKS[i].name,
      parentId: 'sendToDiscord',
      contexts: ['selection', 'image'],
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith('sendToDiscord')) {
    const webhookIndex = info.menuItemId.split('-')[1];
    const webhookUrl = WEBHOOKS[webhookIndex].url;

    if (info.selectionText) {
      sendMessageToDiscord(info.selectionText, webhookUrl);
    } else if (info.srcUrl) {
      const imageUrl = info.srcUrl;
      const caption = await promptUserForCaption(webhookUrl, window);
      if (caption !== null) {
        sendImageToDiscord(imageUrl, caption, webhookUrl);
      }
    }
  }
});

async function sendMessageToDiscord(message, webhookUrl) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    console.error('Error sending message to Discord:', error);
  }
}

async function sendImageToDiscord(imageUrl, caption, webhookUrl) {
  try {
    const imageBlob = await fetch(imageUrl, { mode: 'cors' }).then((r) => r.blob());
    const formData = new FormData();

    const fileName = imageUrl
      .substring(imageUrl.lastIndexOf('/') + 1)
      .replace(/(\.jpg|\.jpeg|\.png|\.gif|\.webp)(\?.*)?$/i, '$1');

    formData.append('file', imageBlob, fileName);
    formData.append(
      'payload_json',
      JSON.stringify({
        content: caption,
      })
    );

    await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Error sending image to Discord:', error);
  }
}

function promptUserForCaption(webhookUrl) {
  return new Promise((resolve) => {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 300,
        height: 200,
        left: Math.round(screen.width / 2 - 150),
        top: Math.round(screen.height / 2 - 100),
      },
      (popupWindow) => {
        const captionListener = (request, sender, sendResponse) => {
          if (request.type === 'captionSubmit') {
            sendImageToDiscord(request.imageUrl, request.caption, webhookUrl);
            chrome.windows.remove(popupWindow.id);
          } else if (request.type === 'captionCancel') {
            resolve(null);
            chrome.windows.remove(popupWindow.id);
          }
        };

        chrome.runtime.onMessage.addListener(captionListener);

        chrome.windows.onRemoved.addListener(() => {
          chrome.runtime.onMessage.removeListener(captionListener);
          resolve(null);
        });
      }
    );
  });
}

