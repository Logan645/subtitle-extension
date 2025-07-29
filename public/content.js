// Content script for subtitle extension
class SubtitleManager {
  constructor() {
    this.videos = new Map();
    this.subtitles = new Map();
    this.isEnabled = false;
    this.init();
  }

  init() {
    // 監聽來自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "TOGGLE_SUBTITLES") {
        this.toggleSubtitles(request.enabled);
        sendResponse({ success: true });
      }
    });

    // 檢測頁面上的影片
    this.detectVideos();

    // 監聽DOM變化，檢測動態加載的影片
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
        });

        this.setupVideo(video);
      }
    });
  }

  setupVideo(video) {
    // 創建字幕容器
    const subtitleContainer = this.createSubtitleContainer();
    video.parentElement.style.position = "relative";
    video.parentElement.appendChild(subtitleContainer);

    this.videos.get(video).subtitleContainer = subtitleContainer;

    // 監聽影片事件
    video.addEventListener("play", () => this.onVideoPlay(video));
    video.addEventListener("pause", () => this.onVideoPause(video));
    video.addEventListener("timeupdate", () => this.onVideoTimeUpdate(video));

    // 添加控制按鈕
    this.addSubtitleControls(video);
  }

  createSubtitleContainer() {
    const container = document.createElement("div");
    container.className = "subtitle-container";
    container.style.cssText = `
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      max-width: 80%;
      z-index: 1000;
      display: none;
    `;
    return container;
  }

  addSubtitleControls(video) {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "subtitle-controls";
    controlsContainer.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1001;
    `;

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "字幕";
    toggleButton.style.cssText = `
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSubtitles(!this.isEnabled);
    });

    controlsContainer.appendChild(toggleButton);
    video.parentElement.appendChild(controlsContainer);
  }

  onVideoPlay(video) {
    if (this.isEnabled && !this.subtitles.has(video)) {
      this.generateSubtitlesForVideo(video);
    }
  }

  onVideoPause(video) {
    // 暫停時可以暫停字幕更新
  }

  onVideoTimeUpdate(video) {
    if (this.isEnabled && this.subtitles.has(video)) {
      this.updateSubtitleDisplay(video);
    }
  }

  async generateSubtitlesForVideo(video) {
    try {
      // 顯示加載狀態
      const videoInfo = this.videos.get(video);
      if (videoInfo.subtitleContainer) {
        videoInfo.subtitleContainer.textContent = "正在生成字幕...";
        videoInfo.subtitleContainer.style.display = "block";
      }

      // 這裡應該提取影片的音頻並發送到background script
      // 由於瀏覽器限制，我們使用模擬數據

      // 發送消息到background script
      chrome.runtime.sendMessage(
        {
          type: "GENERATE_SUBTITLES",
          audioData: "mock_audio_data",
        },
        (response) => {
          if (response.success) {
            this.subtitles.set(video, response.subtitles);
            console.log("字幕生成成功:", response.subtitles);

            // 立即顯示第一個字幕（如果影片正在播放）
            if (!video.paused) {
              this.updateSubtitleDisplay(video);
            }
          } else {
            console.error("字幕生成失敗:", response.error);
            if (videoInfo.subtitleContainer) {
              videoInfo.subtitleContainer.textContent = "字幕生成失敗";
            }
          }
        }
      );
    } catch (error) {
      console.error("生成字幕時出錯:", error);
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
    console.log("切換字幕狀態:", enabled);
    this.isEnabled = enabled;

    this.videos.forEach((videoInfo, video) => {
      if (videoInfo.subtitleContainer) {
        if (enabled) {
          // 立即生成字幕，不需要等待影片播放
          this.generateSubtitlesForVideo(video);
        } else {
          videoInfo.subtitleContainer.style.display = "none";
        }
      }
    });
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 初始化字幕管理器
const subtitleManager = new SubtitleManager();
