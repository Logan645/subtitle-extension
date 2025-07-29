// Background script for subtitle extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("自動字幕生成器已安裝");
});

// 監聽來自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_VIDEO_AUDIO") {
    // 這裡可以添加音頻處理邏輯
    console.log("收到音頻數據請求");
    sendResponse({ success: true });
  }

  if (request.type === "GENERATE_SUBTITLES") {
    // 這裡可以調用字幕生成API
    console.log("開始生成字幕");
    generateSubtitles(request.audioData)
      .then((subtitles) => {
        sendResponse({ success: true, subtitles });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道開啟
  }
});

// 模擬字幕生成功能
async function generateSubtitles(audioData) {
  // 這裡應該調用實際的語音識別API
  // 例如：Google Speech-to-Text, Azure Speech Services, 或 OpenAI Whisper

  // 模擬API調用延遲
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 返回模擬的字幕數據
  return [
    { start: 0, end: 3, text: "歡迎使用自動字幕生成器" },
    { start: 3, end: 6, text: "這是一個演示字幕" },
    { start: 6, end: 9, text: "實際使用時會調用真實的語音識別API" },
  ];
}
