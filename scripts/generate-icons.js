const fs = require("fs");
const path = require("path");

// 創建scripts目錄
if (!fs.existsSync("scripts")) {
  fs.mkdirSync("scripts");
}

// 簡單的圖標生成腳本
console.log("圖標生成腳本已創建");
console.log("請使用在線SVG到PNG轉換工具將icon.svg轉換為以下尺寸：");
console.log("- icon16.png (16x16)");
console.log("- icon48.png (48x48)");
console.log("- icon128.png (128x128)");
console.log("");
console.log("推薦工具：");
console.log("- https://convertio.co/svg-png/");
console.log("- https://cloudconvert.com/svg-to-png");
console.log("- 或使用Inkscape、GIMP等圖像編輯軟件");
