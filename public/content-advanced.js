// Advanced content script with audio extraction capabilities
class AdvancedSubtitleManager {
  constructor() {
    this.videos = new Map();
    this.subtitles = new Map();
    this.isEnabled = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.apiProvider = "whisper";
    this.init();
  }

  init() {
    // 監聽來自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "TOGGLE_SUBTITLES_ADVANCED") {
        this.toggleSubtitles(request.enabled);
        sendResponse({ success: true });
      }

      if (request.type === "SET_API_PROVIDER") {
        this.apiProvider = request.provider;
        sendResponse({ success: true });
      }
    });

    // 檢測頁面上的影片
    this.detectVideos();

    // 監聽DOM變化
    const observer = new MutationObserver(() => {
      this.detectVideos();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  detectVideos() {
    const videoElements = document.querySelectorAll("video");

    videoElements.forEach((video) => {
      if (!this.videos.has(video)) {
        this.videos.set(video, {
          id: this.generateId(),
          element: video,
          subtitleContainer: null,
          audioStream: null,
        });

        this.setupAdvancedVideo(video);
      }
    });
  }

  async setupAdvancedVideo(video) {
    // 創建字幕容器
    const subtitleContainer = this.createAdvancedSubtitleContainer();
    video.parentElement.style.position = "relative";
    video.parentElement.appendChild(subtitleContainer);

    this.videos.get(video).subtitleContainer = subtitleContainer;

    // 嘗試獲取音頻流
    try {
      await this.setupAudioCapture(video);
    } catch (error) {
      console.warn("無法設置音頻捕獲:", error);
    }

    // 監聽影片事件
    video.addEventListener("play", () => this.onVideoPlay(video));
    video.addEventListener("pause", () => this.onVideoPause(video));
    video.addEventListener("timeupdate", () => this.onVideoTimeUpdate(video));
    video.addEventListener("ended", () => this.onVideoEnded(video));

    // 添加控制按鈕
    this.addAdvancedSubtitleControls(video);
  }

  async setupAudioCapture(video) {
    // 嘗試從影片元素獲取音頻流
    try {
      // 注意：由於瀏覽器安全限制，直接從video元素獲取音頻流可能不可行
      // 這裡提供一個替代方案
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // 創建音頻源
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination); // 保持原有音頻輸出

      this.videos.get(video).audioStream = destination.stream;
    } catch (error) {
      console.warn("音頻捕獲設置失敗，將使用模擬數據:", error);
    }
  }

  createAdvancedSubtitleContainer() {
    const container = document.createElement("div");
    container.className = "advanced-subtitle-container";
    container.style.cssText = `
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      max-width: 85%;
      z-index: 1000;
      display: none;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    `;
    return container;
  }

  addAdvancedSubtitleControls(video) {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "advanced-subtitle-controls";
    controlsContainer.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1001;
      display: flex;
      gap: 8px;
    `;

    // 字幕開關按鈕
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "字幕";
    toggleButton.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    `;

    toggleButton.addEventListener("mouseenter", () => {
      toggleButton.style.transform = "scale(1.05)";
    });

    toggleButton.addEventListener("mouseleave", () => {
      toggleButton.style.transform = "scale(1)";
    });

    toggleButton.addEventListener("click", () => {
      this.toggleSubtitles(!this.isEnabled);
    });

    // 設置按鈕
    const settingsButton = document.createElement("button");
    settingsButton.textContent = "⚙️";
    settingsButton.style.cssText = `
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    `;

    settingsButton.addEventListener("click", () => {
      this.showSettings();
    });

    controlsContainer.appendChild(toggleButton);
    controlsContainer.appendChild(settingsButton);
    video.parentElement.appendChild(controlsContainer);
  }

  onVideoPlay(video) {
    if (this.isEnabled && !this.subtitles.has(video)) {
      this.startAudioRecording(video);
    }
  }

  onVideoPause(video) {
    if (this.isRecording) {
      this.stopAudioRecording(video);
    }
  }

  onVideoEnded(video) {
    if (this.isRecording) {
      this.stopAudioRecording(video);
    }
  }

  onVideoTimeUpdate(video) {
    if (this.isEnabled && this.subtitles.has(video)) {
      this.updateSubtitleDisplay(video);
    }
  }

  async startAudioRecording(video) {
    const videoInfo = this.videos.get(video);
    if (!videoInfo.audioStream) {
      console.warn("無法獲取音頻流，使用模擬數據");
      this.generateMockSubtitles(video);
      return;
    }

    try {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(videoInfo.audioStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioData(video);
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      // 顯示錄製狀態
      if (videoInfo.subtitleContainer) {
        videoInfo.subtitleContainer.textContent = "正在錄製音頻...";
        videoInfo.subtitleContainer.style.display = "block";
      }
    } catch (error) {
      console.error("音頻錄製失敗:", error);
      this.generateMockSubtitles(video);
    }
  }

  stopAudioRecording(video) {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  async processAudioData(video) {
    try {
      const videoInfo = this.videos.get(video);

      if (videoInfo.subtitleContainer) {
        videoInfo.subtitleContainer.textContent = "正在生成字幕...";
      }

      const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

      // 發送到background script進行處理
      chrome.runtime.sendMessage(
        {
          type: "GENERATE_SUBTITLES_ADVANCED",
          audioBlob: audioBlob,
          provider: this.apiProvider,
        },
        (response) => {
          if (response.success) {
            this.subtitles.set(video, response.subtitles);
            console.log("字幕生成成功:", response.subtitles);

            if (videoInfo.subtitleContainer) {
              videoInfo.subtitleContainer.style.display = "none";
            }
          } else {
            console.error("字幕生成失敗:", response.error);
            if (videoInfo.subtitleContainer) {
              videoInfo.subtitleContainer.textContent = `字幕生成失敗: ${response.error}`;
            }
          }
        }
      );
    } catch (error) {
      console.error("音頻處理失敗:", error);
      this.generateMockSubtitles(video);
    }
  }

  generateMockSubtitles(video) {
    // 生成模擬字幕數據
    const mockSubtitles = [
      { start: 0, end: 3, text: "歡迎使用自動字幕生成器" },
      { start: 3, end: 6, text: "這是一個演示字幕" },
      { start: 6, end: 9, text: "實際使用時會調用真實的語音識別API" },
      { start: 9, end: 12, text: "支持多種語音識別服務" },
      { start: 12, end: 15, text: "包括OpenAI Whisper等" },
    ];

    this.subtitles.set(video, mockSubtitles);

    const videoInfo = this.videos.get(video);
    if (videoInfo.subtitleContainer) {
      videoInfo.subtitleContainer.style.display = "none";
    }
  }

  updateSubtitleDisplay(video) {
    const currentTime = video.currentTime;
    const subtitles = this.subtitles.get(video);
    const videoInfo = this.videos.get(video);

    if (!subtitles || !videoInfo.subtitleContainer) return;

    // 找到當前時間對應的字幕
    const currentSubtitle = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );

    if (currentSubtitle) {
      videoInfo.subtitleContainer.textContent = currentSubtitle.text;
      videoInfo.subtitleContainer.style.display = "block";
    } else {
      videoInfo.subtitleContainer.style.display = "none";
    }
  }

  toggleSubtitles(enabled) {
    this.isEnabled = enabled;

    this.videos.forEach((videoInfo, video) => {
      if (videoInfo.subtitleContainer) {
        if (enabled) {
          if (!this.subtitles.has(video)) {
            // 如果影片正在播放，開始錄製
            if (!video.paused) {
              this.startAudioRecording(video);
            }
          }
        } else {
          videoInfo.subtitleContainer.style.display = "none";
          if (this.isRecording) {
            this.stopAudioRecording(video);
          }
        }
      }
    });
  }

  showSettings() {
    // 創建設置彈窗
    const settingsModal = document.createElement("div");
    settingsModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const settingsContent = document.createElement("div");
    settingsContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
    `;

    settingsContent.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #333;">字幕設置</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #666;">API提供商:</label>
        <select id="apiProvider" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="whisper">OpenAI Whisper</option>
          <option value="google">Google Speech-to-Text</option>
          <option value="azure">Azure Speech Services</option>
        </select>
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #666;">API密鑰:</label>
        <input type="password" id="apiKey" placeholder="輸入您的API密鑰" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancelBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">取消</button>
        <button id="saveBtn" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">保存</button>
      </div>
    `;

    settingsModal.appendChild(settingsContent);
    document.body.appendChild(settingsModal);

    // 事件處理
    document.getElementById("cancelBtn").onclick = () => {
      document.body.removeChild(settingsModal);
    };

    document.getElementById("saveBtn").onclick = () => {
      const provider = document.getElementById("apiProvider").value;
      const apiKey = document.getElementById("apiKey").value;

      this.apiProvider = provider;

      if (apiKey) {
        chrome.runtime.sendMessage({
          type: "SET_API_KEY",
          apiKey: apiKey,
        });
      }

      document.body.removeChild(settingsModal);
    };
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 初始化進階字幕管理器
const advancedSubtitleManager = new AdvancedSubtitleManager();
