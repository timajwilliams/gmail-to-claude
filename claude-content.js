console.log("Claude content script loaded");

function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }
    }, 100);
  });
}

function simulateSend(editableDiv) {
  return new Promise((resolve, reject) => {
    // Try different selectors for the send button
    const sendButton = document.querySelector('button[aria-label="Send Message"]') ||
                       document.querySelector('button[type="submit"]') ||
                       editableDiv.closest('form').querySelector('button');
    
    if (sendButton) {
      console.log("Send button found:", sendButton);
      sendButton.click();
      console.log("Clicked send button");
      resolve();
    } else {
      console.error("Send button not found");
      reject(new Error("Send button not found"));
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in Claude content script:", request);
  if (request.action === "pasteEmail") {
    console.log("Attempting to paste email");
    waitForElement('div[contenteditable="true"]')
      .then((editableDiv) => {
        console.log("Editable div found:", editableDiv);
        
        // Preserve line breaks and spaces without using <pre>
        const formattedContent = request.emailBody
          .replace(/\n/g, '<br>')
          .replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length));
        
        editableDiv.innerHTML = formattedContent;
        editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("Text pasted into editable div");
        
        // Increase timeout to allow for any UI updates
        setTimeout(() => {
          simulateSend(editableDiv)
            .then(() => {
              console.log("Prompt sent successfully");
              sendResponse({success: true, message: "Email pasted and sent successfully"});
            })
            .catch((error) => {
              console.error("Error sending prompt:", error);
              sendResponse({success: false, message: "Failed to send prompt"});
            });
        }, 1000); // Increased timeout to 1000ms
      })
      .catch((error) => {
        console.error("Error finding editable div:", error);
        sendResponse({success: false, message: error.toString()});
      });
    return true; // Indicates that the response is sent asynchronously
  }
});