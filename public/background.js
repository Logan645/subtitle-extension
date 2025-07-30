// Background script for subtitle extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("自動字幕生成器已安裝");
  
  // 設置默認配置
  chrome.storage.sync.set({
    isEnabled: false,
    subtitleStyle: 'default',
    language: 'zh-TW'
  });
});

// 監聽來自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GENERATE_SUBTITLES") {
    console.log("開始生成字幕", request);
    generateSubtitles(request)
      .then((subtitles) => {
        sendResponse({ success: true, subtitles });
      })
      .catch((error) => {
        console.error("字幕生成錯誤:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道開啟
  }
  
  if (request.type === "GET_SETTINGS") {
    chrome.storage.sync.get(['isEnabled', 'subtitleStyle', 'language'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.type === "SAVE_SETTINGS") {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 增強的模擬字幕生成功能
async function generateSubtitles(request) {
  const { videoSrc, duration } = request;
  
  console.log("生成字幕參數:", { videoSrc, duration });

  // 模擬API調用延遲
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 根據影片時長生成更豐富的模擬字幕
  const subtitles = [];
  const sampleTexts = [
    "歡迎觀看這個影片",
    "字幕功能正在運行中",
    "這是自動生成的字幕",
    "支持多種語言識別",
    "字幕會根據音頻內容生成",
    "感謝使用字幕插件",
    "影片內容正在播放",
    "字幕同步顯示中",
    "這是演示用的字幕文本",
    "實際使用時會調用真實API"
  ];
  
  const videoDuration = duration || 60; // 默認60秒
  const segmentDuration = 3; // 每段字幕3秒
  const totalSegments = Math.min(Math.floor(videoDuration / segmentDuration), sampleTexts.length);
  
  for (let i = 0; i < totalSegments; i++) {
    subtitles.push({
      start: i * segmentDuration,
      end: (i + 1) * segmentDuration,
      text: sampleTexts[i % sampleTexts.length]
    });
  }
  
  console.log("生成的字幕:", subtitles);
  return subtitles;
}

// 監聽標籤頁更新，重新注入content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 檢查是否是支持的網站
    const supportedSites = ['jable', 'pornhub', 'xvideos', 'youtube', 'bilibili'];
    const isSupportedSite = supportedSites.some(site => 
      tab.url.toLowerCase().includes(site)
    );
    
    if (isSupportedSite) {
      console.log("檢測到支持的影片網站:", tab.url);
    }
  }
});