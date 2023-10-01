import plugin from '../../lib/plugins/plugin.js'
import { createRequire } from 'module'
import lodash from 'lodash'
import fs from 'node:fs'
import { Restart } from '../../plugins/other/restart.js'
import common from '../../lib/common/common.js'

const require = createRequire(import.meta.url)
const { exec, execSync } = require('child_process')

let uping = false

/**
 * 请自行设置三种输出方式
 * 1：原方式
 * 2：单独输出更新插件名称：开始更新 Miao-Yunzai 等
 * 3：只输出一次 开始更新 Miao-Yunzai 随后更新完成合并转发输出
 * 
 * 可使用指令修改输出方式，#修改输出1、#修改输出2、#修改输出3
 */
const types = "3"

export class update extends plugin {
    constructor() {
        super({
            name: '全部更新',
            dsc: '全部更新改转发',
            event: 'message',
            priority: -4000,
            rule: [
                {
                    reg: '^#全部(强制)?更新$',
                    fnc: 'updateAll',
                    permission: 'master'
                },
                {
                    reg: '^#(修改)?输出(1|2|3|方式)$',
                    fnc: 'output',
                    permission: 'master'
                }
            ]
        })

        this.typeName = 'Miao-Yunzai'
    }

    /** 修改输出方式 */
    async output() {
        if (/方式$/.test(this.e.msg)) {
            await this.reply(`当前全部更新输出方式为：${await this.type_(types)}`)
            return true
        } else {
            const msg = this.e.msg.replace(/#|修改|输出|方式/g, "").trim()
            const fileurl = decodeURI(import.meta.url)
            const js_name = fileurl.substring(fileurl.lastIndexOf('/') + 1).split('?')[0]
            const _path = process.cwd() + "/plugins"
            let cfg = fs.readFileSync(_path + `/example/${js_name}`, 'utf8')
            cfg = cfg.replace(/const types.*/, `const types = "${Number(msg)}"`)
            await fs.promises.writeFile(_path + `/example/${js_name}`, cfg, 'utf8')
            await this.e.reply(`全部更新当前设置：${await this.type_(msg)}`)
            return true
        }
    }

    async type_(i) {
        let log
        switch (i) {
            case "1":
                log = "1(原方式输出)"
                break
            case "2":
                log = "2(合并转发更新日志)"
                break
            case "3":
                log = "3(合并转发全部输出)"
                break
        }
        return log
    }

    async update() {
        if (!this.e.isMaster) return false
        if (uping) return this.reply('已有命令更新中..请勿重复操作')

        if (/详细|详情|面板|面版/.test(this.e.msg)) return false

        /** 获取插件 */
        const plugin = this.getPlugin()
        if (plugin === false) return false

        /** 执行更新 */
        await this.runUpdate(plugin)

        /** 是否需要重启 */
        if (this.isUp) {
            // await this.reply('即将执行重启，以应用更新')
            setTimeout(() => this.restart(), 2000)
        }
    }

    getPlugin(plugin = '') {
        if (!plugin) {
            plugin = this.e.msg.replace(/#(强制)?更新(日志)?/, '')
            if (!plugin) return ''
        }

        if (!fs.existsSync(`plugins/${plugin}/.git`)) return false

        this.typeName = plugin
        return plugin
    }

    async execSync(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
                resolve({ error, stdout, stderr })
            })
        })
    }

    async runUpdate(plugin = '') {
        const log = []
        this.isNowUp = false

        let cm = 'git pull --no-rebase'

        let type = '更新'
        if (this.e.msg.includes('强制')) {
            type = '强制更新'
            cm = `git reset --hard && git pull --rebase --allow-unrelated-histories`
        }
        if (plugin) cm = `cd "plugins/${plugin}" && ${cm}`

        this.oldCommitId = await this.getcommitId(plugin)

        logger.mark(`${this.e.logFnc} 开始${type}：${this.typeName}`)

        /** 根据设置选择输出方式 */
        const msg = `开始${type} ${this.typeName}`
        if (types === "3") {
            if (this.typeName === "Miao-Yunzai") {
                await this.reply(msg + "\n当前正在进行全部更新，插件较多，请耐心等待更新完成")
            }
            log.push(`开始${type} ${this.typeName}`)
        } else {
            await this.reply(msg)
        }

        uping = true
        const ret = await this.execSync(cm)
        uping = false

        if (ret.error) {
            log.push(`${this.e.logFnc} 更新失败：${this.typeName}`)
            log.push(...await this.gitErr(ret.error, ret.stdout))

            /** 根据设置选择输出方式 */
            if (types === "1") return false
            else return log
        }

        const time = await this.getTime(plugin)

        if (/Already up|已经是最新/g.test(ret.stdout)) {
            const msgA = `${this.typeName} 已是最新\n最后更新时间：${time}`

            /** 根据设置选择输出方式 */
            if (types === "1") await this.reply(msgA)
            else log.push(msgA)
        } else {
            this.isUp = true
            const msgA = `${this.typeName} 更新成功\n更新时间：${time}`
            const msgB = await this.getLog(plugin)

            /** 根据设置选择输出方式 */
            if (types === "1") {
                await this.reply(msgA)
                await this.reply(msgB)
            } else {
                log.push(msgA)
                log.push(msgB)
            }
        }

        logger.mark(`${this.e.logFnc} 最后更新时间：${time}`)

        /** 根据设置选择输出方式 */
        if (types === "1") return true
        else return log
    }

    async getcommitId(plugin = '') {
        let cm = 'git rev-parse --short HEAD'
        if (plugin) cm = `cd "plugins/${plugin}" && ${cm}`

        const commitId = await execSync(cm, { encoding: 'utf-8' })
        return lodash.trim(commitId)
    }

    async getTime(plugin = '') {
        let cm = 'git log -1 --pretty=%cd --date=format:"%F %T"'
        if (plugin) cm = `cd "plugins/${plugin}" && ${cm}`

        let time = ''
        try {
            time = await execSync(cm, { encoding: 'utf-8' })
            time = lodash.trim(time)
        } catch (error) {
            logger.error(error.toString())
            time = '获取时间失败'
        }

        return time
    }

    async gitErr(err, stdout) {
        const msg = '更新失败！'
        const errMsg = err.toString()
        stdout = stdout.toString()

        if (errMsg.includes('Timed out')) {
            const remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')
            return `${msg}\n连接超时：${remote}`
        }

        if (/Failed to connect|unable to access/g.test(errMsg)) {
            const remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')
            return `${msg}\n连接失败：${remote}`
        }

        if (errMsg.includes('be overwritten by merge')) {
            return `${msg}\n存在冲突：\n${errMsg}\n请解决冲突后再更新，或者执行#强制更新，放弃本地修改`
        }

        if (stdout.includes('CONFLICT')) {
            return `${msg}\n存在冲突：\n${errMsg}${stdout}\n请解决冲突后再更新，或者执行#强制更新，放弃本地修改`
        }

        return [errMsg, stdout]
    }

    async updateAll() {
        const Update_log = []
        const dirs = fs.readdirSync('./plugins/')

        await this.runUpdate()

        for (let plu of dirs) {
            plu = this.getPlugin(plu)
            if (plu === false) continue
            await common.sleep(1500)

            try {
                /** 根据设置选择输出方式 */
                if (types !== "1") {
                    Update_log.push(...(await this.runUpdate(plu)))
                } else {
                    await this.runUpdate(plu)
                }
            } catch (err) {
                /** 根据设置选择输出方式 */
                if (types !== "1") {
                    Update_log.push(err)
                } else {
                    await this.reply(JSON.stringify(err))
                }
            }
        }

        /** 根据设置选择输出方式 */
        if (types !== "1") {
            await this.reply(await common.makeForwardMsg(this.e, Update_log, `更新完成，共${Update_log.length}条更新日志`))
        } else {
            await this.reply(`全部更新完成~`)
        }

        if (this.isUp) {
            // await this.reply('即将执行重启，以应用更新')
            setTimeout(() => this.restart(), 2000)
        }
    }

    restart() {
        new Restart(this.e).restart()
    }

    async getLog(plugin = '') {
        let cm = 'git log -100 --pretty="%h||[%cd] %s" --date=format:"%F %T"'
        if (plugin) cm = `cd "plugins/${plugin}" && ${cm}`

        let logAll
        try {
            logAll = await execSync(cm, { encoding: 'utf-8' })
        } catch (error) {
            logger.error(error.toString())
            await this.reply(error.toString())
        }

        if (!logAll) return false

        logAll = logAll.trim().split('\n')

        let log = []
        for (let str of logAll) {
            str = str.split('||')
            if (str[0] == this.oldCommitId) break
            if (str[1].includes('Merge branch')) continue
            log.push(str[1])
        }
        let line = log.length
        log = log.join('\n\n')

        if (log.length <= 0) return ''

        let end = ''
        try {
            cm = 'git config -l'
            if (plugin) cm = `cd "plugins/${plugin}" && ${cm}`
            end = await execSync(cm, { encoding: 'utf-8' })
            end = end.match(/remote\..*\.url=.+/g).join('\n\n').replace(/remote\..*\.url=/g, '')
        } catch (error) {
            logger.error(error.toString())
            await this.reply(error.toString())
        }

        return common.makeForwardMsg(this.e, [log, end], `${plugin || 'Miao-Yunzai'} 更新日志，共${line}条`)
    }
}