// Debug version of content script for subtitle extension
class SubtitleManager {
  constructor() {
    this.videos = new Map();
    this.subtitles = new Map();
    this.isEnabled = false;
    this.detectionTimeout = null;
    this.init();
    console.log("🎬 字幕管理器已初始化");
  }

  init() {
    console.log("🔧 初始化字幕管理器...");

    // 監聽來自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("📨 收到消息:", request);
      if (request.type === "TOGGLE_SUBTITLES") {
        this.toggleSubtitles(request.enabled);
        sendResponse({ success: true });
      }
    });

    // 檢測頁面上的影片
    this.detectVideos();

    // 監聽DOM變化，檢測動態加載的影片（添加防抖）
    const observer = new MutationObserver((mutations) => {
      // 檢查是否有新的video元素被添加
      let hasNewVideo = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === "VIDEO" || node.querySelector("video")) {
              hasNewVideo = true;
            }
          }
        });
      });

      if (hasNewVideo) {
        console.log("🔄 檢測到新的影片元素，重新檢測...");
        this.debouncedDetectVideos();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // 防抖函數，避免重複檢測
  debouncedDetectVideos() {
    if (this.detectionTimeout) {
      clearTimeout(this.detectionTimeout);
    }
    this.detectionTimeout = setTimeout(() => {
      this.detectVideos();
    }, 500);
  }

  detectVideos() {
    const videoElements = document.querySelectorAll("video");
    console.log(`🎥 檢測到 ${videoElements.length} 個影片元素`);

    let newVideosCount = 0;
    videoElements.forEach((video, index) => {
      if (!this.videos.has(video)) {
        console.log(`📹 設置新影片 ${index + 1}:`, video.src || "無src");
        this.videos.set(video, {
          id: this.generateId(),
          element: video,
          subtitleContainer: null,
        });

        this.setupVideo(video);
        newVideosCount++;
      }
    });

    if (newVideosCount > 0) {
      console.log(`✅ 成功設置 ${newVideosCount} 個新影片`);
    }
  }

  setupVideo(video) {
    console.log("🔧 設置影片:", video.src || "無src");

    // 創建字幕容器
    const subtitleContainer = this.createSubtitleContainer();
    video.parentElement.style.position = "relative";
    video.parentElement.appendChild(subtitleContainer);

    this.videos.get(video).subtitleContainer = subtitleContainer;

    // 監聽影片事件
    video.addEventListener("play", () => {
      console.log("▶️ 影片開始播放:", video.src || "無src");
      this.onVideoPlay(video);
    });
    video.addEventListener("pause", () => {
      console.log("⏸️ 影片暫停:", video.src || "無src");
      this.onVideoPause(video);
    });
    video.addEventListener("timeupdate", () => {
      this.onVideoTimeUpdate(video);
    });

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
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      max-width: 85%;
      z-index: 1000;
      display: none;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    console.log("📝 創建字幕容器");
    return container;
  }

  addSubtitleControls(video) {
    console.log("🎛️ 添加字幕控制按鈕");

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

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🔘 字幕按鈕被點擊，當前狀態:", this.isEnabled);
      this.toggleSubtitles(!this.isEnabled);
    });

    toggleButton.addEventListener("mouseenter", () => {
      toggleButton.style.transform = "scale(1.05)";
    });

    toggleButton.addEventListener("mouseleave", () => {
      toggleButton.style.transform = "scale(1)";
    });

    controlsContainer.appendChild(toggleButton);
    video.parentElement.appendChild(controlsContainer);
    console.log("✅ 字幕控制按鈕已添加");
  }

  onVideoPlay(video) {
    console.log("▶️ 影片播放事件觸發");
    if (this.isEnabled && !this.subtitles.has(video)) {
      console.log("🎬 開始生成字幕...");
      this.generateSubtitlesForVideo(video);
    }
  }

  onVideoPause(video) {
    console.log("⏸️ 影片暫停事件觸發");
  }

  onVideoTimeUpdate(video) {
    if (this.isEnabled && this.subtitles.has(video)) {
      this.updateSubtitleDisplay(video);
    }
  }

  async generateSubtitlesForVideo(video) {
    console.log("🎬 開始為影片生成字幕:", video.src || "無src");

    try {
      // 顯示加載狀態
      const videoInfo = this.videos.get(video);
      if (videoInfo.subtitleContainer) {
        videoInfo.subtitleContainer.textContent = "正在生成字幕...";
        videoInfo.subtitleContainer.style.display = "block";
        console.log("📝 顯示「正在生成字幕...」");
      }

      // 發送消息到background script
      console.log("📤 發送字幕生成請求到background script");
      chrome.runtime.sendMessage(
        {
          type: "GENERATE_SUBTITLES",
          audioData: "mock_audio_data",
        },
        (response) => {
          console.log("📥 收到background script回應:", response);

          if (response && response.success) {
            this.subtitles.set(video, response.subtitles);
            console.log("✅ 字幕生成成功:", response.subtitles);

            // 立即顯示第一個字幕（如果影片正在播放）
            if (!video.paused) {
              console.log("📺 影片正在播放，立即顯示字幕");
              this.updateSubtitleDisplay(video);
            }
          } else {
            console.error(
              "❌ 字幕生成失敗:",
              response ? response.error : "無回應"
            );
            if (videoInfo.subtitleContainer) {
              videoInfo.subtitleContainer.textContent = "字幕生成失敗";
            }
          }
        }
      );
    } catch (error) {
      console.error("💥 生成字幕時出錯:", error);
    }
  }

  updateSubtitleDisplay(video) {
    const currentTime = video.currentTime;
    const subtitles = this.subtitles.get(video);
    const videoInfo = this.videos.get(video);

    if (!subtitles || !videoInfo.subtitleContainer) {
      console.log("⚠️ 無法更新字幕顯示:", {
        hasSubtitles: !!subtitles,
        hasContainer: !!videoInfo.subtitleContainer,
      });
      return;
    }

    // 找到當前時間對應的字幕
    const currentSubtitle = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );

    if (currentSubtitle) {
      videoInfo.subtitleContainer.textContent = currentSubtitle.text;
      videoInfo.subtitleContainer.style.display = "block";
      console.log(
        `📝 顯示字幕: "${currentSubtitle.text}" (時間: ${currentTime.toFixed(
          1
        )}s)`
      );
    } else {
      videoInfo.subtitleContainer.style.display = "none";
      console.log(`📝 隱藏字幕 (時間: ${currentTime.toFixed(1)}s)`);
    }
  }

  toggleSubtitles(enabled) {
    console.log(`🔄 切換字幕狀態: ${enabled ? "啟用" : "停用"}`);
    this.isEnabled = enabled;

    this.videos.forEach((videoInfo, video) => {
      if (videoInfo.subtitleContainer) {
        if (enabled) {
          console.log("🎬 啟用字幕，立即生成...");
          // 立即生成字幕，不需要等待影片播放
          this.generateSubtitlesForVideo(video);
        } else {
          console.log("🚫 停用字幕");
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
console.log("🚀 開始載入字幕管理器...");
const subtitleManager = new SubtitleManager();

// 將字幕管理器暴露到全局，方便調試
window.subtitleManager = subtitleManager;
console.log("✅ 字幕管理器已載入並暴露到全局變量");
