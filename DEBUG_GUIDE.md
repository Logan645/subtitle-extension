# 🐛 字幕插件調試指南

## 問題描述
點擊影片上的「字幕」按鈕後，影片暫停但沒有顯示字幕。

## 🔍 調試步驟

### 1. 檢查插件是否正確載入

1. 打開Chrome擴展頁面：`chrome://extensions/`
2. 確保插件已啟用（開關是藍色的）
3. 點擊「重新載入」按鈕
4. 檢查是否有錯誤信息

### 2. 使用測試頁面

1. 在瀏覽器中打開：`file:///path/to/your/project/public/test.html`
2. 或者將 `test.html` 複製到本地並打開
3. 查看頁面底部的調試信息

### 3. 檢查瀏覽器控制台

1. 按 `F12` 打開開發者工具
2. 切換到「Console」標籤
3. 查看是否有錯誤信息或調試日誌

### 4. 使用調試版本

如果問題持續，可以臨時使用調試版本：

1. 將 `public/manifest.json` 中的：
   ```json
   "js": ["content.js"]
   ```
   改為：
   ```json
   "js": ["content-debug.js"]
   ```

2. 重新載入插件
3. 查看控制台的詳細日誌

## 🔧 常見問題和解決方案

### 問題1：插件未載入
**症狀**：控制台沒有看到「字幕管理器已初始化」的日誌

**解決方案**：
- 檢查 `manifest.json` 格式是否正確
- 確保所有引用的文件都存在
- 重新載入插件

### 問題2：影片元素未檢測到
**症狀**：控制台顯示「檢測到 0 個影片元素」

**解決方案**：
- 確保頁面包含 `<video>` 元素
- 檢查影片是否正確載入
- 等待頁面完全載入後再測試

### 問題3：按鈕點擊無反應
**症狀**：點擊「字幕」按鈕沒有日誌輸出

**解決方案**：
- 檢查按鈕是否被其他元素遮擋
- 確保按鈕的 z-index 足夠高
- 檢查是否有JavaScript錯誤

### 問題4：字幕生成失敗
**症狀**：顯示「字幕生成失敗」

**解決方案**：
- 檢查background script是否正常運行
- 查看background script的控制台日誌
- 確保網絡連接正常

### 問題5：字幕容器未顯示
**症狀**：字幕生成成功但看不到字幕

**解決方案**：
- 檢查字幕容器的CSS樣式
- 確保z-index足夠高
- 檢查父元素的position設置

## 📋 調試檢查清單

- [ ] 插件已啟用並重新載入
- [ ] 控制台沒有JavaScript錯誤
- [ ] 看到「字幕管理器已初始化」日誌
- [ ] 檢測到影片元素
- [ ] 字幕按鈕已添加
- [ ] 點擊按鈕有日誌輸出
- [ ] 字幕生成請求已發送
- [ ] 收到background script回應
- [ ] 字幕容器已創建
- [ ] 字幕文本已設置

## 🎯 快速測試

1. **基本測試**：
   ```javascript
   // 在控制台執行
   console.log('影片數量:', document.querySelectorAll('video').length);
   console.log('字幕管理器:', window.subtitleManager);
   ```

2. **手動觸發**：
   ```javascript
   // 手動啟用字幕
   if (window.subtitleManager) {
     window.subtitleManager.toggleSubtitles(true);
   }
   ```

3. **檢查元素**：
   ```javascript
   // 檢查字幕容器
   document.querySelectorAll('.subtitle-container').forEach((el, i) => {
     console.log(`字幕容器 ${i}:`, el.style.display, el.textContent);
   });
   ```

## 📞 獲取幫助

如果以上步驟都無法解決問題，請提供：

1. 瀏覽器控制台的完整日誌
2. 測試頁面的調試信息
3. 使用的Chrome版本
4. 目標網站的URL（如果適用）

## 🔄 恢復正常版本

調試完成後，記得將 `manifest.json` 改回使用 `content.js`：

```json
"js": ["content.js"]
``` 