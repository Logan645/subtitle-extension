// Content script for subtitle extension
class SubtitleManager {
  constructor() {
    this.videos = new Map();
    this.subtitles = new Map();
    this.isEnabled = false;
    this.detectionInterval = null;
    this.init();
  }

  init() {
    console.log("字幕管理器初始化中...");
    
    // 監聽來自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "TOGGLE_SUBTITLES") {
        this.toggleSubtitles(request.enabled);
        sendResponse({ success: true });
      }
      
      if (request.type === "GET_VIDEO_COUNT") {
        sendResponse({ count: this.videos.size });
      }
    });

    // 初始檢測和持續監控
    this.startVideoDetection();

    // 頁面卸載時清理
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  startVideoDetection() {
    // 立即檢測一次
    this.detectVideos();
    
    // 設置定期檢測，適應動態加載的內容
    this.detectionInterval = setInterval(() => {
      this.detectVideos();
    }, 2000);
    
    // 監聽DOM變化
    const observer = new MutationObserver((mutations) => {
      let shouldDetect = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'VIDEO' || node.querySelector && node.querySelector('video')) {
                shouldDetect = true;
              }
            }
          });
        }
      });
      
      if (shouldDetect) {
        setTimeout(() => this.detectVideos(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  detectVideos() {
    const videoElements = document.querySelectorAll("video");
    console.log(`檢測到 ${videoElements.length} 個影片元素`);

    videoElements.forEach((video) => {
      if (!this.videos.has(video)) {
        console.log("設置新影片:", video.src || video.currentSrc || "無來源");
        this.videos.set(video, {
          id: this.generateId(),
          element: video,
          subtitleContainer: null,
          controlsAdded: false,
        });

        this.setupVideo(video);
      }
    });
  }

  setupVideo(video) {
    const videoInfo = this.videos.get(video);
    if (videoInfo.controlsAdded) return;
    
    // 創建字幕容器
    const subtitleContainer = this.createSubtitleContainer();
    
    // 確保父元素存在且可以添加子元素
    const parent = video.parentElement || video.parentNode;
    if (parent && parent.nodeType === Node.ELEMENT_NODE) {
      parent.style.position = "relative";
      parent.appendChild(subtitleContainer);
    } else {
      // 如果沒有合適的父元素，創建一個包裝器
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      video.parentNode.insertBefore(wrapper, video);
      wrapper.appendChild(video);
      wrapper.appendChild(subtitleContainer);
    }

    videoInfo.subtitleContainer = subtitleContainer;

    // 監聽影片事件
    video.addEventListener("play", () => this.onVideoPlay(video));
    video.addEventListener("pause", () => this.onVideoPause(video));
    video.addEventListener("timeupdate", () => this.onVideoTimeUpdate(video));
    video.addEventListener("loadedmetadata", () => this.onVideoLoaded(video));

    // 添加控制按鈕
    this.addSubtitleControls(video);
    videoInfo.controlsAdded = true;
  }

  onVideoLoaded(video) {
    console.log("影片元數據已載入:", video.duration);
  }

  createSubtitleContainer() {
    const container = document.createElement("div");
    container.className = "subtitle-container";
    container.style.cssText = `
      position: absolute;
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      max-width: 85%;
      z-index: 9999;
      display: none;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      word-wrap: break-word;
      line-height: 1.4;
    `;
    return container;
  }

  addSubtitleControls(video) {
    // 檢查是否已經添加過控制按鈕
    const existingControls = video.parentElement?.querySelector('.subtitle-controls');
    if (existingControls) return;
    
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "subtitle-controls";
    controlsContainer.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10000;
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
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("字幕按鈕被點擊");
      this.toggleSubtitles(!this.isEnabled);
    });

    toggleButton.addEventListener("mouseenter", () => {
      toggleButton.style.transform = "scale(1.05)";
      toggleButton.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.4)";
    });

    toggleButton.addEventListener("mouseleave", () => {
      toggleButton.style.transform = "scale(1)";
      toggleButton.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
    });

    controlsContainer.appendChild(toggleButton);
    
    const parent = video.parentElement || video.parentNode;
    if (parent && parent.nodeType === Node.ELEMENT_NODE) {
      parent.appendChild(controlsContainer);
    }
  }

  onVideoPlay(video) {
    console.log("影片開始播放");
    if (this.isEnabled && !this.subtitles.has(video)) {
      this.generateSubtitlesForVideo(video);
    }
  }

  onVideoPause(video) {
    console.log("影片暫停");
  }

  onVideoTimeUpdate(video) {
    if (this.isEnabled && this.subtitles.has(video)) {
      this.updateSubtitleDisplay(video);
    }
  }

  async generateSubtitlesForVideo(video) {
    console.log("開始生成字幕");
    try {
      // 顯示加載狀態
      const videoInfo = this.videos.get(video);
      if (videoInfo.subtitleContainer) {
        videoInfo.subtitleContainer.textContent = "正在生成字幕...";
        videoInfo.subtitleContainer.style.display = "block";
      }

      // 發送消息到background script
      chrome.runtime.sendMessage(
        {
          type: "GENERATE_SUBTITLES",
          videoSrc: video.src || video.currentSrc,
          duration: video.duration,
        },
        (response) => {
          if (response && response.success) {
            this.subtitles.set(video, response.subtitles);
            console.log("字幕生成成功:", response.subtitles);

            // 立即顯示第一個字幕（如果影片正在播放）
            if (!video.paused) {
              this.updateSubtitleDisplay(video);
            }
          } else {
            console.error("字幕生成失敗:", response ? response.error : "無回應");
            if (videoInfo.subtitleContainer) {
              videoInfo.subtitleContainer.textContent = "字幕生成失敗";
              setTimeout(() => {
                videoInfo.subtitleContainer.style.display = "none";
              }, 3000);
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

    // 更新所有按鈕狀態
    document.querySelectorAll('.subtitle-controls button').forEach(button => {
      button.style.background = enabled 
        ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.textContent = enabled ? '字幕✓' : '字幕';
    });

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

  cleanup() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 初始化字幕管理器
const subtitleManager = new SubtitleManager();

// 暴露到全局以便調試
window.subtitleManager = subtitleManager;
