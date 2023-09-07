import fs from 'fs'
import common from '../../lib/common/common.js'
export class photo1 extends plugin {
    constructor() {
        super({
            name: '转发',
            dsc: '转发',
            event: 'message',
            priority: 6,
            rule: [
                {
                    reg: '^#转发$',
                    fnc: '转发'
                }
            ]
        })

    }

    async 转发() {
        const base64 = Buffer.from(fs.readFileSync("")).toString('base64')
        const forward = [
            "www.baidu.com我com",
            "https://www.baidu.com",
            "baidu.com",
            "Object.makeForwardMsg",
            "https://www.Zyy955.com",
            segment.at(this.e.user_id),
            segment.image(`base64://${base64}`),

        ]
        const msg = await common.makeForwardMsg(this.e, forward, '这里填转发描述')
        this.reply(msg)
        // Bot.pickGroup('18290845201983929601-609188919').sendMsg("QQGuild-plugin：主动消息-Test")
        // Bot.pickFriend("1072411694").sendMsg("你好")
    }
}
