# Chrome插件開發指南

## 項目架構

這個項目現在支持兩種開發模式：

### 1. 簡單模式（純Chrome插件）
- 直接使用 `public/` 文件夾中的文件
- 不需要構建工具
- 適合快速原型開發

### 2. 混合模式（Vite + React + Chrome插件）
- 使用Vite進行開發和構建
- 使用React開發更豐富的popup界面
- 構建後輸出到 `public/` 文件夾

## 開發流程

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
# 啟動Vite開發服務器（用於開發popup界面）
npm run dev

# 在另一個終端中，可以修改public/中的文件進行即時測試
```

### 構建插件
```bash
# 構建React版本的popup
npm run build

# 構建並提示安裝
npm run build:extension
```

### 打包發布
```bash
# 構建並打包為zip文件
npm run package
```

## 文件結構

```
├── src/                    # React源代碼
│   └── popup/             # Popup界面
│       ├── App.tsx        # 主組件
│       ├── App.css        # 樣式
│       ├── main.tsx       # 入口文件
│       └── index.html     # HTML模板
├── public/                # Chrome插件文件
│   ├── manifest.json      # 插件配置
│   ├── background.js      # 後台腳本
│   ├── content.js         # 內容腳本
│   ├── popup.html         # 彈窗界面（構建後）
│   ├── popup.js           # 彈窗邏輯（構建後）
│   └── icon.svg           # 插件圖標
├── vite.config.js         # Vite配置
└── package.json           # 項目配置
```

## 開發建議

### 1. 快速開發
如果您只想快速開發Chrome插件功能：
- 直接修改 `public/` 中的文件
- 在Chrome擴展頁面點擊「重新載入」
- 不需要運行 `npm run dev`

### 2. 豐富界面開發
如果您想要更豐富的popup界面：
- 修改 `src/popup/` 中的React組件
- 運行 `npm run dev` 進行開發
- 運行 `npm run build` 構建到 `public/`

### 3. 混合開發
您可以同時使用兩種方式：
- 使用React開發popup界面
- 直接修改content.js和background.js
- 構建後所有文件都在 `public/` 中

## 調試技巧

### 1. Popup調試
- 在Chrome擴展頁面點擊「檢查視圖：彈出式視窗」
- 或使用Vite開發服務器進行開發

### 2. Content Script調試
- 在目標網頁打開開發者工具
- 查看Console標籤的輸出

### 3. Background Script調試
- 在Chrome擴展頁面點擊「檢查視圖：背景頁」

### 4. 消息傳遞調試
```javascript
// 在content script中
chrome.runtime.sendMessage({type: 'TEST'}, (response) => {
  console.log('Response:', response);
});

// 在background script中
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  sendResponse({success: true});
});
```

## 常見問題

### 1. 插件無法載入
- 檢查 `manifest.json` 格式
- 確保所有引用的文件存在
- 查看Chrome擴展頁面的錯誤信息

### 2. React組件不更新
- 確保運行 `npm run build`
- 檢查構建輸出是否正確
- 重新載入插件

### 3. 樣式問題
- 檢查CSS是否正確構建
- 確認樣式作用域
- 查看開發者工具的樣式面板

### 4. API調用失敗
- 檢查網絡連接
- 確認API密鑰正確
- 查看控制台錯誤信息

## 最佳實踐

### 1. 代碼組織
- 將複雜邏輯分離到不同文件
- 使用模塊化設計
- 保持代碼簡潔

### 2. 錯誤處理
- 添加適當的錯誤處理
- 提供用戶友好的錯誤信息
- 記錄錯誤日誌

### 3. 性能優化
- 避免不必要的DOM操作
- 使用事件委託
- 優化API調用頻率

### 4. 用戶體驗
- 提供清晰的狀態反饋
- 添加載入動畫
- 支持鍵盤快捷鍵

## 部署

### 1. 本地測試
```bash
npm run build
# 在Chrome中載入public文件夾
```

### 2. 發布到Chrome Web Store
```bash
npm run package
# 上傳生成的zip文件到Chrome Web Store
```

### 3. 分發給用戶
- 打包為zip文件
- 提供安裝說明
- 或發布到Chrome Web Store 