# 項目結構

```
subtitle-extension/
├── src/                    # React源代碼
│   └── popup/             # React版本的popup界面
│       ├── App.tsx        # 主組件
│       ├── App.css        # 樣式
│       ├── main.tsx       # 入口文件
│       └── index.html     # HTML模板
├── public/                # Chrome插件文件
│   ├── manifest.json      # 插件配置
│   ├── background.js      # 基礎版後台腳本
│   ├── background-advanced.js # 進階版後台腳本
│   ├── content.js         # 基礎版內容腳本
│   ├── content-advanced.js # 進階版內容腳本
│   ├── popup.html         # 基礎版彈窗界面
│   ├── popup.js           # 基礎版彈窗邏輯
│   ├── icon.svg           # 插件圖標
│   └── icon16.png         # 16x16圖標
├── scripts/               # 工具腳本
│   └── generate-icons.js  # 圖標生成腳本
├── vite.config.js         # Vite配置
├── package.json           # 項目配置
├── tsconfig.json          # TypeScript配置
├── eslint.config.js       # ESLint配置
├── .gitignore             # Git忽略文件
├── README.md              # 項目說明
├── DEVELOPMENT.md         # 開發指南
├── install.md             # 安裝指南
└── PROJECT_STRUCTURE.md   # 本文件
```

## 文件說明

### 核心文件
- `public/manifest.json`: Chrome插件配置文件
- `public/background.js`: 後台腳本（基礎版）
- `public/content.js`: 內容腳本（基礎版）
- `public/popup.html/js`: 彈窗界面（基礎版）

### 進階文件
- `public/background-advanced.js`: 後台腳本（支持真實API）
- `public/content-advanced.js`: 內容腳本（支持音頻提取）

### React開發
- `src/popup/`: React版本的popup界面源代碼
- `vite.config.js`: Vite構建配置

### 配置文件
- `package.json`: 項目依賴和腳本
- `tsconfig.json`: TypeScript配置
- `eslint.config.js`: 代碼檢查配置

### 文檔
- `README.md`: 項目介紹和使用說明
- `DEVELOPMENT.md`: 開發指南
- `install.md`: 安裝指南 