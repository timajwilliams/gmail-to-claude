function expandAllEmails() {
  return new Promise((resolve) => {
    const expandAllButton = document.querySelector('button[aria-label="Expand all"]');
    if (expandAllButton) {
      console.log("Expand all button found, clicking it");
      expandAllButton.click();
      // Wait for the expansion to complete
      setTimeout(() => {
        console.log("Waiting for expansion to complete");
        waitForExpansionComplete().then(resolve);
      }, 1000);
    } else {
      console.log("Expand all button not found");
      resolve();
    }
  });
}

function waitForExpansionComplete() {
  return new Promise((resolve) => {
    const checkExpansion = setInterval(() => {
      const expandAllButton = document.querySelector('button[aria-label="Expand all"]');
      if (!expandAllButton) {
        console.log("Expansion complete");
        clearInterval(checkExpansion);
        resolve();
      }
    }, 500);
  });
}

function getFullThread() {
  return new Promise((resolve) => {
    console.log("Starting to get full thread");
    expandAllEmails().then(() => {
      const threadContainer = document.querySelector('div[role="list"]');
      if (!threadContainer) {
        console.log("Thread container not found");
        resolve('Thread container not found');
        return;
      }

      let fullThread = '';
      const emailContainers = threadContainer.querySelectorAll('div[role="listitem"]');
      
      console.log(`Found ${emailContainers.length} email containers`);
      emailContainers.forEach((container, index) => {
        console.log(`Processing email ${index + 1}`);
        fullThread += processEmail(container) + '\n---\n\n';
      });

      console.log("Full thread processed");
      resolve(fullThread.trim());
    });
  });
}

function processEmail(container) {
  const senderElement = container.querySelector('span[email]');
  const sender = senderElement ? senderElement.getAttribute('email') : 'Unknown Sender';

  const dateElement = container.querySelector('span[title]');
  const dateTime = dateElement ? dateElement.getAttribute('title') : 'Unknown Date';

  const bodyElement = container.querySelector('div[data-message-id] div.a3s.aiL');
  const body = bodyElement ? bodyElement.innerText.trim() : 'No content';

  console.log(`Processed email from ${sender}`);
  return `From: ${sender}\nDate: ${dateTime}\n\n${body}`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "getEmailBody") {
    console.log("Getting full thread");
    getFullThread().then(threadContent => {
      console.log("Thread content retrieved:", threadContent);
      sendResponse({emailBody: threadContent});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

console.log("Gmail content script loaded");