document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusText = document.getElementById('statusText');
  const loading = document.getElementById('loading');
  let currentVideoCount = 0;

  // 載入保存的設置
  chrome.storage.sync.get(['isEnabled'], function(result) {
    const isEnabled = result.isEnabled || false;
    updateToggleState(isEnabled);
  });

  // 檢查當前頁面的影片數量
  checkVideoCount();
  
  // 每2秒更新一次影片數量
  setInterval(checkVideoCount, 2000);

  function checkVideoCount() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'GET_VIDEO_COUNT'}, function(response) {
          if (chrome.runtime.lastError) {
            statusText.textContent = '請重新載入頁面以啟用字幕功能';
            return;
          }
          
          if (response && typeof response.count === 'number') {
            currentVideoCount = response.count;
            updateStatusText();
          }
        });
      }
    });
  }

  function updateStatusText() {
    if (currentVideoCount > 0) {
      statusText.textContent = `檢測到 ${currentVideoCount} 個影片`;
    } else {
      statusText.textContent = '未檢測到影片元素';
    }
  }

  // 切換開關事件
  toggleSwitch.addEventListener('click', function() {
    const isCurrentlyEnabled = toggleSwitch.classList.contains('active');
    const newState = !isCurrentlyEnabled;
    
    if (currentVideoCount === 0) {
      alert('當前頁面沒有檢測到影片，請確保頁面已完全載入');
      return;
    }
    
    updateToggleState(newState);
    
    // 保存設置
    chrome.storage.sync.set({isEnabled: newState});
    
    // 顯示載入狀態
    showLoading(newState);
    
    // 發送消息到content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_SUBTITLES',
          enabled: newState
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('無法發送消息到content script');
            statusText.textContent = '請重新載入頁面以啟用字幕功能';
          }
        });
      }
    });
  });

  function showLoading(enabled) {
    if (enabled) {
      loading.style.display = 'block';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 3000);
    } else {
      loading.style.display = 'none';
    }
  }

  function updateToggleState(isEnabled) {
    if (isEnabled) {
      toggleSwitch.classList.add('active');
      statusText.style.color = '#4CAF50';
    } else {
      toggleSwitch.classList.remove('active');
      statusText.style.color = '';
    }
  }
});