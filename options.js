import defaultSettings from './defaults.js';
  
  function saveOptions() {
    const prependText = document.getElementById('prependText').value;
    const appendText = document.getElementById('appendText').value;
    chrome.storage.sync.set({
      prependText: prependText,
      appendText: appendText
    }, () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.style.display = 'block';
      status.style.backgroundColor = '#4CAF50';
      status.style.color = 'white';
      status.style.padding = '10px';
      status.style.marginTop = '10px';
      status.style.borderRadius = '5px';
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    });
  }
  
  function restoreOptions() {
    chrome.storage.sync.get(defaultSettings, (items) => {
      document.getElementById('prependText').value = items.prependText;
      document.getElementById('appendText').value = items.appendText;
    });
  }
  
  function resetToDefault() {
    document.getElementById('prependText').value = defaultSettings.prependText;
    document.getElementById('appendText').value = defaultSettings.appendText;
    saveOptions();
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('reset').addEventListener('click', resetToDefault);