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
    const checkForSendButton = setInterval(() => {
      const sendButton = document.querySelector('button[aria-label="Send Message"]') ||
                         document.querySelector('button[type="submit"]') ||
                         editableDiv.closest('form').querySelector('button');
      
      if (sendButton) {
        clearInterval(checkForSendButton);
        console.log("Send button found:", sendButton);
        sendButton.click();
        console.log("Clicked send button");
        resolve();
      }
    }, 500); // Check every 500ms

    // Set a timeout to stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkForSendButton);
      console.error("Send button not found after 10 seconds");
      reject(new Error("Send button not found after timeout"));
    }, 10000);
  });
}

// ... existing code ...

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in Claude content script:", request);
  if (request.action === "pasteEmail") {
    console.log("Attempting to paste email");
    waitForElement('div[contenteditable="true"]')
      .then((editableDiv) => {
        console.log("Editable div found:", editableDiv);
        
        // Attempt to parse as JSON, if it fails, use the content as-is
        let formattedContent;
        try {
          const parsedContent = JSON.parse(request.emailBody);
          formattedContent = JSON.stringify(parsedContent, null, 2);
        } catch (e) {
          console.log("Input is not JSON, using as plain text");
          formattedContent = request.emailBody;
        }
        
        // Preserve line breaks and spaces
        formattedContent = formattedContent
          .replace(/\n/g, '<br>')
          .replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length));
        
        editableDiv.innerHTML = formattedContent;
        editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("Text pasted into editable div");
        
        setTimeout(() => {
          simulateSend(editableDiv)
            .then(() => {
              console.log("Message sent successfully");
              sendResponse({success: true, message: "Email pasted and sent successfully"});
            })
            .catch((error) => {
              console.error("Error sending message:", error);
              sendResponse({success: false, message: "Failed to send message"});
            });
        }, 1000); // Wait for 1 second before attempting to send
        
        // ... rest of the existing code ...
      })
      .catch((error) => {
        console.error("Error finding editable div:", error);
        sendResponse({success: false, message: error.toString()});
      });
    return true; // Indicates that the response is sent asynchronously
  }
});