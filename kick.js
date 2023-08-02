/* 
暂时只支持以下几种场景
喵崽的QQ群 私聊
时雨崽的QQ群 私聊 QQ频道插件
不支持喵崽的频道插件 时雨崽的gocq频道
*/

import fs from 'fs'
import puppeteer from '../../lib/puppeteer/puppeteer.js'

const file = `${process.cwd()}/resources`

export class kick extends plugin {
    constructor() {
        super({
            name: '踢',
            dsc: '表情包生成',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^#(踢|滚|kick)$/,
                    fnc: 'kick'
                }
            ]
        })
    }


    async kick(e) {
        /** 检测html是否存在 */
        if (!fs.existsSync(`${file}/kick/kick.html`)) html()
        /** 定义头像链接 */
        let url = e.author?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`
        /** 存在at的时候处理链接 */
        if (e.at) url = e.mentions?.[0]?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`

        /** 定义基础参数 */
        const data = {
            imgurl: url,
            saveId: 'kick',
            _plugin: 'kick',
            tplFile: './resources/kick/kick.html',
        }
        return e.reply(await puppeteer.screenshot(`kick/kick`, data))
    }
}

function html() {
    if (!fs.existsSync(file + "/kick")) fs.mkdirSync(file + "/kick")

    const htmlContent = `<!DOCTYPE html>
    <html>
    
    <head>
      <meta http-equiv="content-type" content="text/html;charset=utf-8" />
      <style>
        html,
        body {
          margin: 0;
          padding: 0;
          width: 500px;
          /* 固定宽度为500px */
          height: 500px;
          /* 固定高度为500px */
        }
    
        body {
          transform-origin: 0 0;
          width: 500px;
          /* 固定宽度为500px */
          height: 500px;
          /* 固定高度为500px */
          background-color: rgb(5, 18, 32);
          position: absolute;
          top: 0;
          left: 0;
          background-size: cover;
          /* 图片铺满body容器 */
        }
    
        .image-container {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 200px;
          height: 200px;
          overflow: hidden;
          /* 保证图片不超出容器尺寸 */
          transform: rotate(-30deg);
          /* 逆时针旋转45度 */
        }
    
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* 图片铺满容器，保持比例 */
          border-radius: 50%;
          /* 将容器变成圆形 */
        }
      </style>
    </head>
    
    <body>
      <img src="https://cdn.jsdelivr.net/gh/Zyy955/Yunzai-Bot-plugin/kick/kick.jpg" alt="img">
      <div class="image-container">
        <img src="{{imgurl}}" alt="kick">
      </div>
    </body>
    
    </html>`

    if (!fs.existsSync(file + "/kick/kick.html")) fs.writeFileSync(file + "/kick/kick.html", htmlContent)
}