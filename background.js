const WEBHOOKS = [
  { name: 'Sản phẩm', url: 'https://discord.com/api/webhooks/1089251807492059260/BJZDx7Hf4vDfGWkFg7TCHt5YVsADFgXENNeReJCUEyA7w-FOQo3D1TGX_hGikPtiu-P6' },
  { name: 'Hai Từ', url: 'https://discord.com/api/webhooks/1089125987708588062/t1i7F_MYtyq5Zpyr3Pn2iOTh4BZhKrFnaJYsNlACAE2zEo8iMpBgcSZSGDtWfX9U_wlQ' },
  { name: 'Ba Từ', url: 'https://discord.com/api/webhooks/1089219104428281936/-PZHk-cfp1Awk6-FTcm9rNy_LjgXtoHsIlA3kHUwuwEqn0odgTIbp86GwjoAGuBedzyQ' },
  { name: 'Bốn Từ', url: 'https://discord.com/api/webhooks/1089219430074044418/czqfOD6D_RbGhX0lzHO0m97wFuWsMdNm3auwRTHWRPPIKo-Lr--oz5VrfTkbKChQGQBW' },
  { name: 'Năm Từ', url: 'https://discord.com/api/webhooks/1089219519249125376/N0sxjOZEB0N5ew2GZXbVOgKS2mxPAsI3m-G3FA_1rMPvqB12pENtq3DLt_huE0ldAR4H' },
  { name: 'Trouvalle', url: 'https://discord.com/api/webhooks/1089219631404810280/WO5LumX71Ixp-44pcKS4hx23zGTn5_xcllcaChQVBkW_VYXrKuVJylc68SQrt0PAPR4L' },
  { name: 'Hatsukoi', url: 'https://discord.com/api/webhooks/1089219830541996152/BMnoZgA5UdQdzsiBmhiPW1roJMJWgcdPevBXJxv9j9v15AQLUGJuP3SKMNMZ1B4_fHaQ' },
  { name: 'Kawaii Pets', url: 'https://discord.com/api/webhooks/1089219948133503137/WHfkZmFnsKqCWrYqjxd9honQibufzwe5Dnje9Vudk4-FptB3IrLvXbVkt9sfkfH0ajwl' },
];

const WEBHOOKS_WITH_ICON = WEBHOOKS.map(webhook => {
  return {
    ...webhook,
    name: '🚀 ' + webhook.name
  };
});


chrome.runtime.onInstalled.addListener(() => {
  // Create main context menu
  chrome.contextMenus.create({
    id: 'sendToDiscord',
    title: 'Đá Content',
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

  // Create sub context menu "Đá vui" under "Đá Content"
  chrome.contextMenus.create({
    id: 'joke',
    title: 'Đá vui',
    parentId: 'sendToDiscord',
    contexts: ['selection', 'image'],
  });

  // Create sub context menu "Đá chính thức" under "Đá Content"
  chrome.contextMenus.create({
    id: 'official',
    title: 'Đá chính thức',
    parentId: 'sendToDiscord',
    contexts: ['selection', 'image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith('sendToDiscord')) {
    const webhookIndex = info.menuItemId.split('-')[1];
    const webhookUrl = WEBHOOKS[webhookIndex].url;

    if (info.selectionText) {
      sendMessageToDiscord(info.selectionText, webhookUrl);
    } else if (info.srcUrl) {
      const imageUrl = info.srcUrl;
      const caption = await promptUserForCaption(webhookUrl);
      if (caption !== null) {
        sendImageToDiscord(imageUrl, caption, webhookUrl);
      }
    }
  } else if (info.menuItemId === 'joke') {
    let caption = '';
    let imageUrl = '';

    if (info.selectionText) {
      caption = info.selectionText;
    }

    if (info.srcUrl) {
      imageUrl = info.srcUrl;
    }

    promptUserForPostFB(caption, imageUrl);

  } else if (info.menuItemId === 'official') {
    // handle "Đá chính thức" sub menu item
    // your code here
  }
});

function promptUserForPostFB(caption, imageUrl) {
  return new Promise((resolve) => {
    // Lưu giá trị caption và imageUrl vào local storage của extension
    chrome.runtime.sendMessage({
      type: 'CAPTION_IMAGE_DATA',
      caption: caption,
      imageUrl: imageUrl
    });

    // Lấy thông tin về tab đang được chọn
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Truyền thông tin về tab vào message để options.js có thể sử dụng
      const tab = tabs[0];
      chrome.runtime.sendMessage({
        type: 'TAB_DATA',
        tab: {
          id: tab.id,
          title: tab.title,
          url: tab.url
        }
      });

      // Kiểm tra xem có dữ liệu được tô đen hay không
      chrome.tabs.executeScript(tab.id, { code: 'window.getSelection().toString();' }, (selection) => {
        if (selection && selection[0]) {
          // Nếu có dữ liệu, truyền nó vào message cùng với thông tin về tab
          chrome.runtime.sendMessage({
            type: 'TAB_SELECTION_DATA',
            tab: {
              id: tab.id,
              title: tab.title,
              url: tab.url
            },
            selection: selection[0]
          });
        }
      });

      // Mở trang options.html
      const popupUrl = chrome.runtime.getURL('options.html');
      chrome.windows.create({ url: popupUrl, type: 'popup', width: 500, height: 350 }, (popupWindow) => {
        resolve();
      });
    });
  });
}




function promptUserForCaption() {
  return new Promise((resolve) => {
    const popupUrl = chrome.runtime.getURL('popup.html');
    chrome.windows.create({ url: popupUrl, type: 'popup', width: 500, height: 350 }, (popupWindow) => {
      const listener = (message, sender, sendResponse) => {
        if (sender.id === chrome.runtime.id && message.type === 'CAPTION_INPUT') {
          resolve(message.caption);
          chrome.windows.remove(popupWindow.id);
          chrome.runtime.onMessage.removeListener(listener);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
    });
  });
}

async function sendMessageToDiscord(message, webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Discord webhook:', error);
  }
}

async function sendImageToDiscord(imageUrl, caption, webhookUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  let fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
  fileName = fileName.replace(/(.jpg|.png)[\s\S]*/, '$1'); // Remove characters after .jpg or .png

  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('payload_json', JSON.stringify({ content: caption }));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error sending image to Discord: ' + response.statusText);
    }
  } catch (error) {
    console.error(error);
    alert('Đã xảy ra lỗi khi gửi ảnh đến Discord');
  }
}
