# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# 自動字幕生成器 Chrome 插件

這是一個Chrome瀏覽器插件，可以自動為網頁上的影片生成和顯示字幕。

## 功能特點

- 🎬 自動檢測網頁上的影片元素
- 🎯 支持大多數影片網站（包括Jable等）
- 🔄 實時字幕生成和顯示
- 🎨 美觀的字幕顯示界面
- ⚡ 輕量級設計，不影響頁面性能

## 安裝方法

### 開發模式安裝

1. 下載或克隆此項目到本地
2. 打開Chrome瀏覽器，進入擴展程序頁面：
   - 在地址欄輸入：`chrome://extensions/`
   - 或者點擊右上角菜單 → 更多工具 → 擴展程序

3. 開啟「開發者模式」（右上角開關）

4. 點擊「載入未封裝項目」

5. 選擇項目中的 `public` 文件夾

6. 插件安裝完成！

## 使用方法

1. **啟用插件**：點擊瀏覽器右上角的插件圖標

2. **檢測影片**：插件會自動檢測當前頁面上的影片

3. **啟用字幕**：
   - 方法一：在插件彈窗中點擊「啟用自動字幕」開關
   - 方法二：點擊影片右上角的「字幕」按鈕

4. **觀看字幕**：開始播放影片，字幕會自動生成並顯示在影片底部

## 技術架構

這個項目支持兩種開發模式：

### 簡單模式（純Chrome插件）
```
public/
├── manifest.json          # 插件配置文件
├── background.js          # 後台腳本
├── content.js            # 內容腳本
├── popup.html            # 彈窗界面
├── popup.js              # 彈窗邏輯
└── icon.svg              # 插件圖標
```

### 混合模式（Vite + React）
```
src/
└── popup/                # React版本的popup界面
    ├── App.tsx           # 主組件
    ├── App.css           # 樣式
    ├── main.tsx          # 入口文件
    └── index.html        # HTML模板

public/                   # 構建後的Chrome插件文件
├── manifest.json         # 插件配置
├── background.js         # 後台腳本
├── content.js           # 內容腳本
├── popup.html           # 彈窗界面（構建後）
├── popup.js             # 彈窗邏輯（構建後）
└── icon.svg             # 插件圖標
```

### 核心組件

- **Background Script**: 處理字幕生成邏輯
- **Content Script**: 檢測影片元素並添加字幕顯示
- **Popup**: 提供用戶控制界面（支持React開發）

## 字幕生成

目前版本使用模擬數據進行演示。要實現真正的字幕生成，需要：

1. **語音識別API**: 集成如Google Speech-to-Text、Azure Speech Services或OpenAI Whisper
2. **音頻提取**: 從影片中提取音頻數據
3. **時間同步**: 將識別結果與影片時間軸同步

### 推薦的語音識別服務

- **OpenAI Whisper**: 免費且準確度高
- **Google Speech-to-Text**: 支持多種語言
- **Azure Speech Services**: 企業級解決方案

## 自定義配置

### 字幕樣式

可以在 `content.js` 中的 `createSubtitleContainer()` 方法修改字幕顯示樣式：

```javascript
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
```

### 支持更多網站

插件默認支持所有包含 `<video>` 元素的網站。如需針對特定網站優化，可以在 `content.js` 中添加特殊處理邏輯。

## 開發說明

### 本地開發

1. 安裝依賴：
   ```bash
   npm install
   ```

2. 開發模式：
   ```bash
   # 啟動Vite開發服務器（用於React開發）
   npm run dev
   
   # 或直接修改public/中的文件進行快速開發
   ```

3. 構建：
   ```bash
   # 構建React版本的popup
   npm run build
   
   # 構建並提示安裝
   npm run build:extension
   ```

### 開發模式選擇

#### 快速開發（推薦新手）
- 直接修改 `public/` 中的文件
- 在Chrome擴展頁面點擊「重新載入」
- 不需要運行構建命令

#### 豐富界面開發
- 修改 `src/popup/` 中的React組件
- 運行 `npm run dev` 進行開發
- 運行 `npm run build` 構建到 `public/`

### 文件結構

- `src/popup/`: React版本的popup界面源代碼
- `public/`: Chrome插件文件（最終使用）
- `manifest.json`: 插件配置
- `background.js`: 後台邏輯
- `content.js`: 頁面注入腳本
- `popup.html/js`: 用戶界面（構建後）

## 注意事項

1. **權限要求**: 插件需要訪問所有網站的權限來檢測影片
2. **性能影響**: 插件設計為輕量級，對頁面性能影響最小
3. **兼容性**: 支持Chrome 88+版本
4. **隱私**: 插件不會收集或傳輸用戶數據

## 故障排除

### 常見問題

1. **插件無法載入**
   - 確保開啟了開發者模式
   - 檢查manifest.json文件格式是否正確

2. **字幕不顯示**
   - 確認影片元素存在
   - 檢查瀏覽器控制台是否有錯誤信息

3. **字幕生成失敗**
   - 檢查網絡連接
   - 確認API服務是否正常

## 貢獻

歡迎提交Issue和Pull Request來改進這個項目！

## 授權

MIT License
