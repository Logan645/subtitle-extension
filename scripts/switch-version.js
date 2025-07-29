#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.join(__dirname, "../public/manifest.json");

function switchToBasic() {
  console.log("🔄 切換到基礎版本...");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.action.default_popup = "popup.html";

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("✅ 已切換到基礎版本");
  console.log("📝 請在Chrome擴展頁面點擊「重新載入」");
}

function switchToReact() {
  console.log("🔄 切換到React版本...");

  // 先構建React版本
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ React版本構建完成");
  } catch (error) {
    console.error("❌ 構建失敗:", error.message);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.action.default_popup = "src/popup/index.html";

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("✅ 已切換到React版本");
  console.log("📝 請在Chrome擴展頁面點擊「重新載入」");
}

function showHelp() {
  console.log(`
🎬 自動字幕生成器 - 版本切換工具

使用方法:
  node scripts/switch-version.js basic    # 切換到基礎版本
  node scripts/switch-version.js react    # 切換到React版本
  node scripts/switch-version.js help     # 顯示幫助

版本說明:
  - basic: 使用純HTML/JS的popup界面
  - react: 使用React開發的豐富popup界面
`);
}

const version = process.argv[2];

switch (version) {
  case "basic":
    switchToBasic();
    break;
  case "react":
    switchToReact();
    break;
  case "help":
  default:
    showHelp();
    break;
}
