# Chrome插件安裝指南

## 快速安裝步驟

### 1. 下載項目
```bash
git clone <your-repo-url>
cd subtitle-extension
```

### 2. 生成圖標（可選）
如果您想要自定義圖標，請將 `public/icon.svg` 轉換為以下PNG文件：
- `public/icon16.png` (16x16像素)
- `public/icon48.png` (48x48像素)  
- `public/icon128.png` (128x128像素)

### 3. 在Chrome中安裝

1. 打開Chrome瀏覽器
2. 在地址欄輸入：`chrome://extensions/`
3. 開啟右上角的「開發者模式」
4. 點擊「載入未封裝項目」
5. 選擇項目中的 `public` 文件夾
6. 插件安裝完成！

## 版本選擇

### 基礎版本
使用 `public/` 文件夾中的文件：
- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.js`

### 進階版本
如果您想要真實的語音識別功能，請使用：
- `background-advanced.js` (替換 `background.js`)
- `content-advanced.js` (替換 `content.js`)

並在 `manifest.json` 中更新對應的文件名。

## 配置API密鑰（進階版本）

### OpenAI Whisper API
1. 訪問 [OpenAI API](https://platform.openai.com/api-keys)
2. 創建API密鑰
3. 在插件設置中輸入密鑰

### Google Speech-to-Text API
1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 啟用Speech-to-Text API
3. 創建服務帳戶和密鑰
4. 在插件設置中配置

### Azure Speech Services
1. 訪問 [Azure Portal](https://portal.azure.com/)
2. 創建Speech Services資源
3. 獲取API密鑰和區域
4. 在插件設置中配置

## 故障排除

### 插件無法載入
- 檢查 `manifest.json` 格式是否正確
- 確保所有引用的文件都存在
- 查看Chrome擴展頁面的錯誤信息

### 字幕不顯示
- 確認影片元素存在於頁面中
- 檢查瀏覽器控制台是否有錯誤
- 確認插件權限設置正確

### API調用失敗
- 檢查API密鑰是否正確
- 確認網絡連接正常
- 查看API服務狀態

## 開發模式

### 本地開發
```bash
npm install
npm run dev
```

### 重新載入插件
在Chrome擴展頁面點擊插件的「重新載入」按鈕，或在代碼修改後手動重新載入。

### 調試
- 使用Chrome開發者工具查看控制台輸出
- 在擴展頁面點擊「檢查視圖」來調試popup
- 使用 `chrome.runtime.sendMessage` 進行消息調試

## 發布到Chrome Web Store

1. 打包插件：
   ```bash
   zip -r subtitle-extension.zip public/
   ```

2. 訪問 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

3. 上傳插件並填寫相關信息

4. 等待審核通過

## 支持

如果您遇到問題，請：
1. 檢查本文檔的故障排除部分
2. 查看Chrome擴展開發文檔
3. 提交Issue到項目倉庫 