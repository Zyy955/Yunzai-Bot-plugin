import fs from "fs"
import Yaml from "yaml"

/** 保存所有表达式 */
let TaskList = {}

const CfgPath = process.cwd() + "/config/TaskList.yaml"

/** 判断是否已存在配置 */
if (fs.existsSync(CfgPath)) {
    TaskList = Yaml.parse(fs.readFileSync(CfgPath, "utf8"))
}

export class Test extends plugin {
    constructor() {
        super({
            name: "定时任务",
            dsc: "给羊的专属插件",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: /^#(添加|删除)?定时任务(列表$)?.+/,
                    fnc: "Task"
                },
                {
                    reg: /^#当前时间$/,
                    fnc: "time"
                }
            ]
        })
        /** 定时任务 */
        this.task = {
            name: '羊的专属定时任务',
            cron: '* * * * *',
            /** 执行的方法 */
            fnc: () => this.executeTask(),
            /** 是否显示日志 */
            log: false
        }
    }

    /** 执行定时任务 */
    async executeTask() {
        const date = new Date()
        const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} * *`

        const task = TaskList[cronExpression]
        if (!task) return
        logger.info("[定时任务]：开始执行")
        if (task.isGroup) {
            await Bot.pickGroup(Number(task.id)).sendMsg(task.msg)
        } else {
            await Bot.pickUser(task.id).sendMsg(task.msg)
        }
        return logger.info("[定时任务]：执行完毕")
    }


    async Task(e) {
        if (e.msg.includes("添加")) {
            const errMsg = "格式错误\n#添加定时任务 要发送的内容 cron表达式"
            /** 分割 */
            const e_msg = e.msg.replace("#添加定时任务", "").trim().split(" ")
            const msg = e_msg[0]
            let cron = e_msg.slice(1)

            /** 第一次检查 */
            if (!msg || cron.length !== 6) return await e.reply("内容" + errMsg, true, { at: true })
            /** 第二次检查 */
            for (const part of cron) {
                if (!/^\d+$|\*$|\?$/.test(Number(part) || String(part))) return await e.reply("cron表达式" + errMsg, true, { at: true })
            }

            /** 拼接表达式 */
            cron = cron.join(' ')

            /** 判断表达式是否存在 */
            if (TaskList[cron]) return await e.reply("cron表达式已存在", true, { at: true })

            /** 判断当前场景 */
            const isGroup = e.isGroup || false

            /** 更新当前的配置 */
            TaskList[cron] = isGroup ? { isGroup, msg, id: e.group_id } : { isGroup, msg, id: e.user_id }

            /** 同步保存到文件 */
            fs.writeFileSync(CfgPath, Yaml.stringify(TaskList), "utf8")
            return await e.reply("添加成功", true, { at: true })
        }
        else if (e.msg.includes("删除")) {
            /** 对传入的消息进行处理 */
            const msg = (Number(e.msg.replace("#删除定时任务", "").trim()) || 99999) - 1

            /** 获取序号对应的键 */
            const key = Object.keys(TaskList)[msg]

            /** 检测是否存在对应序号的任务 */
            if (!key) return await e.reply("诶嘿，没有这个任务哦~", true, { at: true })

            /** 进行删除 */
            delete TaskList[key]

            /** 同步保存到文件 */
            fs.writeFileSync(CfgPath, Yaml.stringify(TaskList), "utf8")
            return await e.reply("删除成功", true, { at: true })
        } else {
            let i = 1
            const msg = []
            for (let key in TaskList) {
                msg.push(`${i}：${key} - ${TaskList[key].id} - ${TaskList[key].msg ? "群聊" : "好友"} - ${TaskList[key].msg}`)
                i++
            }
            return await e.reply(`\n${msg.join('\n')}`, true, { at: true })
        }
    }

    async time(e) {
        const date = new Date()
        const Time = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} * *`
        return await e.reply(Time, true)
    }
}
