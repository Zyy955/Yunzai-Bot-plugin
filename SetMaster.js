import fs from 'fs'
import crypto from 'crypto'

let user = ""
let sign = {}
const file = process.cwd() + "/config/config/other.yaml"

export class master extends plugin {
    constructor() {
        super({
            name: '设置主人',
            dsc: '快捷设置主人',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^#设置主人$/,
                    fnc: 'master'
                },
                {
                    reg: /^#(删除|取消)主人$/,
                    fnc: "del_master",
                    permission: "master"
                }
            ]
        })
    }

    async master(e) {
        /** 对用户id进行默认赋值 */
        user = e.user_id
        let cfg = fs.readFileSync(file, "utf8")
        if (e.at) {
            /** 存在at检测触发用户是否为主人 */
            if (!e.isMaster) return e.reply(`只有主人才能命令我哦~\n(*/ω＼*)`)
            /** 检测被at的用户是否已经是主人 */
            if (cfg.match(RegExp(`- "?${e.at}"?`)))
                return e.reply([segment.at(e.at), "已经是主人了哦(〃'▽'〃)"])
            user = e.at
            e.reply(add(e))
        } else {
            /** 检测用户是否已经是主人 */
            if (e.isMaster) return e.reply([segment.at(e.user_id), "已经是主人了哦(〃'▽'〃)"])
            /** 生成验证码 */
            sign[e.user_id] = crypto.randomUUID()
            logger.mark(`设置主人验证码：${logger.green(sign[e.user_id])}`)
            /** 开始上下文 */
            this.setContext('SetAdmin')
            e.reply([segment.at(e.user_id), `请输入控制台的验证码`])
        }
    }

    async del_master(e) {
        if (!e.at) return e.reply("你都没有告诉我是谁！快@他吧！^_^")
        let cfg = fs.readFileSync(file, "utf8")
        if (!cfg.match(RegExp(`- "?${e.at}"?`)))
            return e.reply("这个人不是主人啦(〃'▽'〃)", false, { at: true })
        cfg = cfg.replace(RegExp(`\\n  - "?${e.at}"?`), "")
        fs.writeFileSync(file, cfg, "utf8")
        e.reply([segment.at(e.at), "拜拜~"])
    }

    SetAdmin() {
        /** 结束上下文 */
        this.finish('SetAdmin')
        /** 判断验证码是否正确 */
        if (this.e.msg.trim() === sign[this.e.user_id]) {
            this.e.reply(add(this.e))
        } else {
            return this.reply([segment.at(this.e.user_id), "验证码错误"])
        }
    }
}

function add(e) {
    let match
    let text
    let cfg = fs.readFileSync(file, "utf8")
    /** 使用正则表达式确认是TRSS还是Miao */
    if (cfg.match(RegExp("master:"))) {
        cfg = cfg.replace(RegExp("masterQQ:"), `masterQQ:\n  - "${user}"`)
        const value = `master:\n  - "${e.self_id}:${user}"`
        cfg = cfg.replace(RegExp("master:"), value)
    } else {
        const regexp = /masterQQ([\s\S]*?)disableGuildMsg/g
        while ((match = regexp.exec(cfg)) !== null) { text = match[0] }
        const msg = `\n  - ${user}\n# 禁用频道功能 true: 不接受频道消息，flase：接受频道消息\ndisableGuildMsg`
        text = `${text.replace(/((\n#[\s\S]*|\n{1,3})|\n{1,3})?disableGuildMsg/g, "")}${msg}`
        cfg = cfg.replace(RegExp("masterQQ[\\s\\S]*disableGuildMsg"), text)
    }
    fs.writeFileSync(file, cfg, "utf8")
    return [segment.at(user), "新主人好~(*/ω＼*)"]
}