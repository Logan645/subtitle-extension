import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [videoCount, setVideoCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // 檢查當前頁面是否有影片
    checkForVideos()
    
    // 載入保存的設置
    chrome.storage.sync.get(['isEnabled', 'apiKey'], (result) => {
      setIsEnabled(result.isEnabled || false)
      setApiKey(result.apiKey || '')
    })
  }, [])

  const checkForVideos = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const videos = document.querySelectorAll('video')
          return videos.length
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          setVideoCount(0)
          return
        }
        setVideoCount(results[0].result)
      })
    })
  }

  const toggleSubtitles = (enabled: boolean) => {
    setIsEnabled(enabled)
    setIsLoading(enabled)
    
    // 保存設置
    chrome.storage.sync.set({ isEnabled: enabled })
    
    // 發送消息到content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_SUBTITLES',
        enabled: enabled
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('無法發送消息到content script')
        }
      })
    })
  }

  const saveApiKey = () => {
    chrome.storage.sync.set({ apiKey })
    setShowSettings(false)
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🎬 自動字幕生成器</h1>
      </div>

      <div className="status">
        <div className="status-text">
          {videoCount > 0 ? `檢測到 ${videoCount} 個影片` : '未檢測到影片'}
        </div>
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <div>正在生成字幕...</div>
          </div>
        )}
      </div>

      <div className="toggle-container">
        <span className="toggle-label">啟用自動字幕</span>
        <div 
          className={`toggle-switch ${isEnabled ? 'active' : ''}`}
          onClick={() => toggleSubtitles(!isEnabled)}
        >
          <div className="toggle-slider"></div>
        </div>
      </div>

      <div className="info">
        <h3>使用說明：</h3>
        <ul>
          <li>插件會自動檢測頁面上的影片</li>
          <li>點擊影片右上角的「字幕」按鈕啟用字幕</li>
          <li>字幕會在影片播放時自動生成和顯示</li>
          <li>支持大多數影片網站</li>
        </ul>
      </div>

      <div className="settings">
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(true)}
        >
          ⚙️ 設置
        </button>
      </div>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h3>API設置</h3>
            <div className="form-group">
              <label>OpenAI API密鑰:</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="輸入您的API密鑰"
              />
            </div>
            <div className="form-actions">
              <button onClick={() => setShowSettings(false)}>取消</button>
              <button onClick={saveApiKey}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 