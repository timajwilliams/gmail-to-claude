import defaultSettings from './defaults.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(defaultSettings, (items) => {
    if (!items.prependText && !items.appendText) {
      chrome.storage.sync.set(defaultSettings);
    }
  });
});
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(defaultSettings, (items) => {
      if (!items.prependText && !items.appendText) {
        chrome.storage.sync.set(defaultSettings);
      }
    });
  });
  
  chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked");
    if (tab.url.includes("mail.google.com")) {
      chrome.tabs.sendMessage(tab.id, {action: "getEmailBody"}, (response) => {
        console.log("Received response from content script:", response);
        if (chrome.runtime.lastError) {
          console.error("Error getting email body:", chrome.runtime.lastError);
          return;
        }
        if (response && response.emailBody) {
          chrome.storage.sync.get(defaultSettings, (items) => {
            console.log("Retrieved storage items:", items);
            const fullText = `${items.prependText}\n\n${response.emailBody}\n\n${items.appendText}`.trim();
            console.log("Prepared full text:", fullText);
            chrome.tabs.create({url: "https://claude.ai/"}, (newTab) => {
              console.log("Created new tab:", newTab);
              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === newTab.id && info.status === 'complete') {
                  console.log("New tab loaded, sending paste message");
                  chrome.tabs.onUpdated.removeListener(listener);
                  chrome.tabs.sendMessage(newTab.id, {action: "pasteEmail", emailBody: fullText}, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error("Error sending paste message:", chrome.runtime.lastError);
                    } else {
                      console.log("Paste message sent successfully:", response);
                    }
                  });
                }
              });
            });
          });
        } else {
          console.error("No email body received from content script");
        }
      });
    }
  });