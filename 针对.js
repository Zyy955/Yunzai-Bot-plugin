let data = {}

export class ZhenDui extends plugin {
    constructor() {
        super({
            name: '针对',
            event: 'message',
            priority: -5000000,
            rule: [
                {
                    reg: '^#(取消)?针对',
                    fnc: 'zhenDui',
                    permission: 'master'
                },
                {
                    reg: '',
                    fnc: 'Test'
                }
            ]
        })
    }

    async zhenDui() {
        /** 获取需要针对玩家的QQ */
        let qq
        if (this.e.at) {
            qq = this.e.at
        } else {
            qq = this.e.msg.replace(/^#(取消)?针对/, '').trim()
        }
        if (!qq) return await this.reply('请指定一个QQ号', false, { at: true })
        /** 判断是针对还是取消针对 */
        if (this.e.msg.startsWith('#取消针对')) {
            delete data[qq]
            return await this.reply(`已取消针对${qq}`, false, { at: true })
        } else {
            data[qq] = true
            return await this.reply(`已针对${qq}`, false, { at: true })
        }
    }

    async Test() {
        if (data[this.e.user_id]) return await this.e.recall()
        return false
    }
}
