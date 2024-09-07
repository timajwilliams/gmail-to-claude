function getEmailBody() {
    const emailBody = document.querySelector('.a3s.aiL');
    return emailBody ? emailBody.innerText : '';
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmailBody") {
      sendResponse({emailBody: getEmailBody()});
    }
  });