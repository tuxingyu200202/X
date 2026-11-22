# Weihnachten mit dir

美式复古绘本圣诞贺卡。用 Node.js 20.19+ 或 22.12+ 运行 `npm ci` 和 `npm run dev`。使用 `npm run build` 生成静态站点。

编辑 `src/content.js` 可更换文字、图片路径、城市、竞猜或录音。合照放在 `public/photos/`，录音放在 `public/audio/`。扭蛋每转一次即更新地图和明信片，竞猜可以展开或略过。

行李箱图、旅行贴纸来源和视频约会选项可在 `src/content.js` 中编辑，贴纸文字取自各城市名称。

新结尾的窗灯录音在 `evenings.audio`，电话挂件录音在 `tree.ornaments[0].audio`。信件在 `tree.letter`，城市贴纸在 `suitcase.stickers`，见面选项在 `suitcase.choices`。
