import fs from 'fs'
import puppeteer from '../../lib/puppeteer/puppeteer.js'

const file = `${process.cwd()}/resources`

export class invade extends plugin {
    constructor() {
        super({
            name: '怪物入侵',
            dsc: 'invade',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: /^[#/](怪物入侵|invade)$/,
                    fnc: 'invade'
                }
            ]
        })
    }


    async invade(e) {
        /** 检测html是否存在 */
        if (!fs.existsSync(`${file}/invade/invade.html`)) html()
        let name = e.author?.username || e.sender.card || e.sender.nickname || "未知"
        /** 定义头像链接 */
        let url = e.author?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`
        /** 存在at的时候处理链接 */
        if (e.at) {
            name = e?.raw_message?.replace(/@|怪物入侵|\/|#/g, "") || "未知"
            url = e.mentions?.[0]?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`
        }

        /** 定义基础参数 */
        const data = {
            imgurl: url,
            saveId: 'invade',
            _plugin: 'invade',
            tplFile: './resources/invade/invade.html',
        }
        const img = await puppeteer.screenshot(`invade/invade`, data)
        const life = Math.floor(Math.random() * 50001) + 10000
        const Combat = Math.floor(Math.random() * 5001) + 1000
        return e.reply([`● 怪物【${name}】侵入本群！！！\n● 技能：虚弱\n● 血量：${life}\n● 战力：${Combat}\n● 发送指令【攻击怪物】\n● 一起击退怪物吧！！`, img])
    }
}

function html() {
    if (!fs.existsSync(file + "/invade")) fs.mkdirSync(file + "/invade")

    const htmlContent = `<!DOCTYPE html>
    <html>
    
    <head>
      <meta http-equiv="content-type" content="text/html;charset=utf-8" />
      <style>
        html,
        body {
          margin: 20;
          padding: 20;
          width: 640px;
          height: 640px;
        }
    
        .image-container {
          width: 640px;
          height: 640px;
          overflow: hidden;
        }
    
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
    </head>
    
    <body>
      <div class="image-container">
        <img src="{{imgurl}}" alt="invade">
      </div>
    </body>
    
    </html>`

    if (!fs.existsSync(file + "/invade/invade.html")) fs.writeFileSync(file + "/invade/invade.html", htmlContent)
}