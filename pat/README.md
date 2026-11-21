# Weihnachten mit dir

一份用 React 和 Vite 制作的互动圣诞贺卡。旅行明信片、七页绘本、录音和背景音乐随项目一起打包。

## 上传到 GitHub

1. 解压 ZIP。
2. 在 GitHub 新建一个 **Private** 仓库。
3. 在仓库中选择 **Add file → Upload files**，上传解压后的文件和文件夹，让 `package.json`、`index.html`、`src/` 和 `public/` 直接位于仓库根目录。
4. 提交文件。

也可以在解压目录运行下列命令，将最后一行之前的仓库地址换成自己的。

```sh
git init -b main
git add .
git commit -m "Add Christmas card"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## 本地查看

使用 Node.js 22.12 或更高版本。

```sh
npm ci
npm run dev
```

`npm run build` 将生成静态网页目录 `dist/`，`npm run preview` 可在本地预览构建结果。

城市照片、绘本文案、录音和见面券文字都可以在 `src/content.js` 编辑。图片及音频在 `public/` 下。

源码含私人照片与录音。上传到私有仓库仅保存代码。若需要在线分享网页，请另行配置有访问控制的托管。
