/* 
暂时只支持以下几种场景
喵崽的QQ群 私聊
时雨崽的QQ群 私聊 QQ频道插件
不支持喵崽的频道插件 时雨崽的gocq频道
*/

import puppeteer from '../../lib/puppeteer/puppeteer.js'

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
        console.log(e)
        let url = e.author?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`
        if (e.at) url = e.mentions?.[0]?.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`

        const data = {
            imgurl: url,
            saveId: 'kick',
            _plugin: 'ZhiYu-plugin',
            tplFile: './resources/kick/kick.html',
            _res_path: '../../../../resources/kick/',
        }
        return e.reply(await puppeteer.screenshot(`ZhiYu-plugin/kick`, data))
    }
}