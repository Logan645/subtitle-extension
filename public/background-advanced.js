// Advanced background script with real speech recognition API support
class SubtitleGenerator {
  constructor() {
    this.apiKey = null;
    this.loadApiKey();
  }

  async loadApiKey() {
    // 從Chrome存儲中加載API密鑰
    const result = await chrome.storage.sync.get(["openaiApiKey"]);
    this.apiKey = result.openaiApiKey;
  }

  async saveApiKey(apiKey) {
    this.apiKey = apiKey;
    await chrome.storage.sync.set({ openaiApiKey: apiKey });
  }

  async generateSubtitlesWithWhisper(audioBlob) {
    if (!this.apiKey) {
      throw new Error("請先在插件設置中配置OpenAI API密鑰");
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities", "word");

    try {
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API錯誤: ${error.error?.message || "未知錯誤"}`);
      }

      const result = await response.json();
      return this.processWhisperResult(result);
    } catch (error) {
      console.error("Whisper API調用失敗:", error);
      throw error;
    }
  }

  processWhisperResult(result) {
    // 處理Whisper API返回的結果
    const segments = [];

    if (result.segments) {
      result.segments.forEach((segment) => {
        segments.push({
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        });
      });
    }

    return segments;
  }

  async generateSubtitlesWithGoogleSTT(audioBlob) {
    // Google Speech-to-Text API實現
    // 需要Google Cloud項目和API密鑰
    console.log("Google Speech-to-Text功能待實現");
    throw new Error("Google Speech-to-Text功能尚未實現");
  }

  async generateSubtitlesWithAzure(audioBlob) {
    // Azure Speech Services實現
    // 需要Azure訂閱和API密鑰
    console.log("Azure Speech Services功能待實現");
    throw new Error("Azure Speech Services功能尚未實現");
  }
}

const subtitleGenerator = new SubtitleGenerator();

// 監聽來自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GENERATE_SUBTITLES_ADVANCED") {
    handleAdvancedSubtitleGeneration(request, sendResponse);
    return true; // 保持消息通道開啟
  }

  if (request.type === "SET_API_KEY") {
    subtitleGenerator.saveApiKey(request.apiKey);
    sendResponse({ success: true });
  }

  if (request.type === "GET_API_STATUS") {
    sendResponse({
      hasApiKey: !!subtitleGenerator.apiKey,
      provider: request.provider || "whisper",
    });
  }
});

async function handleAdvancedSubtitleGeneration(request, sendResponse) {
  try {
    const { audioBlob, provider = "whisper" } = request;

    let subtitles;

    switch (provider) {
      case "whisper":
        subtitles = await subtitleGenerator.generateSubtitlesWithWhisper(
          audioBlob
        );
        break;
      case "google":
        subtitles = await subtitleGenerator.generateSubtitlesWithGoogleSTT(
          audioBlob
        );
        break;
      case "azure":
        subtitles = await subtitleGenerator.generateSubtitlesWithAzure(
          audioBlob
        );
        break;
      default:
        throw new Error(`不支持的語音識別提供商: ${provider}`);
    }

    sendResponse({ success: true, subtitles });
  } catch (error) {
    console.error("字幕生成失敗:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// 插件安裝時的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log("自動字幕生成器（進階版）已安裝");

  // 創建默認設置
  chrome.storage.sync.set({
    defaultProvider: "whisper",
    autoGenerate: false,
    subtitleStyle: "default",
  });
});
