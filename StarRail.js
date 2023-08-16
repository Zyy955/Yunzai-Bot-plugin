import fs from 'fs'
import moment from 'moment'

let SR = {
    miao: true,
    sr: false
}

export class StarRail extends plugin {
    constructor() {
        super({
            name: '星铁面板-兼容版',
            dsc: '可同时使用miao-plugin和StarRail-plugin',
            event: 'message',
            priority: -1000,
            rule: [
                {
                    reg: '^#星铁更新面板.*$',
                    fnc: 'update'
                },
                {
                    reg: '^#星铁(?!插件)(.+)面板$',
                    fnc: 'StarRail'
                },
                {
                    reg: '^#(喵喵|星铁)?插件面板(开启|关闭|状态)$',
                    fnc: 'Sr'
                }
            ]
        })
    }

    /** 更新全部面板 */
    async update(e) {
        if (SR.miao) {
            ((await import("../miao-plugin/apps/profile/ProfileList.js")).default).refresh(e)
        }

        if (SR.sr) {
            try {
                const panelApi = (await import("../StarRail-plugin/runtime/PanelApi.js")).default
                const api = await panelApi()
                const { Panel } = await import("../StarRail-plugin/apps/panel.js")
                let StarRail = new Panel()
                StarRail.e = e
                StarRail.reply = this.reply
                /** 获取星铁uid */
                const uid = e?.user?.getUid('sr') || ""
                if (!uid) return e.reply("请先绑定星铁UID (^_−)☆")
                const data = await StarRail.getPanelData(uid, false)
                let renderData = {
                    api: api.split('/')[2],
                    uid,
                    data,
                    type: 'update'
                }
                /** 渲染数据 */
                await renderCard(e, renderData)
                return false
            } catch (error) {
                logger.error('SR-panelApi', error)
                return e.reply(error.message)
            }
        }
    }

    /** 查看角色详细面板 */
    async StarRail(e) {
        if (SR.miao) {
            ((await import("../miao-plugin/apps/profile/ProfileDetail.js")).default).detail(e)
        }

        if (SR.sr) {
            try {
                const panelApi = (await import("../StarRail-plugin/runtime/PanelApi.js")).default
                const api = await panelApi()
                const { Panel } = await import("../StarRail-plugin/apps/panel.js")
                let StarRail = new Panel()
                StarRail.e = e
                StarRail.reply = this.reply
                /** 获取星铁uid */
                const uid = e?.user?.getUid('sr') || ""
                if (!uid) return e.reply("请先绑定星铁UID (^_−)☆")
                /** 获取角色名称 */
                const charName = e.msg.replace(/#|星铁|面板|面版/g, "")
                const { pluginRoot } = await import("../StarRail-plugin/utils/path.js")

                /** 引入遗器地址数据 */
                const relicsPathData = readJson('resources/panel/data/relics.json', pluginRoot)
                // 引入角色数据
                const charData = readJson('resources/panel/data/character.json', pluginRoot)
                let data = await StarRail.getCharData(charName, uid, e)
                data.uid = uid
                data.api = api.split('/')[2]
                data.charpath = charData[data.avatarId].path
                data.relics.forEach((item, i) => {
                    data.relics[i].path = relicsPathData[item.id]?.icon
                })
                // 行迹
                data.behaviorList = StarRail.handleBehaviorList(data.behaviorList)
                // 面板图
                data.charImage = StarRail.getCharImage(data.name, data.avatarId)

                logger.debug(`${e.logFnc} 面板图:`, data.charImage)

                const runtimeRender = (await import('../StarRail-plugin/common/runtimeRender.js')).default
                let msgId = await runtimeRender(e, '/panel/new_panel.html', data, { retType: 'msgId', cale: 1.6 })
                msgId && redis.setEx(`STAR_RAILWAY:panelOrigImg:${msgId.message_id}`, 60 * 60, data.charImage)
            } catch (error) {
                logger.error('SR-panelApi', error)
                return await e.reply(error.message)
            }
        }
    }
    async Sr(e) {
        const fileurl = import.meta.url
        const sr_name = fileurl.substring(fileurl.lastIndexOf('/') + 1).split('?')[0]
        const _path = process.cwd() + "/plugins"
        let cfg = fs.readFileSync(_path + `/example/${sr_name}`, 'utf8')
        const msg = e.msg
        if (/喵喵/.test(msg)) {
            if (/开启/.test(msg) && !SR.miao) {
                SR.miao = true
                cfg = cfg.replace('miao: false', 'miao: true')
            } else if (/关闭/.test(msg) && SR.miao) {
                SR.miao = false
                cfg = cfg.replace('miao: true', 'miao: false')
            }
        } else if (/星铁/.test(msg)) {
            if (!fs.existsSync(_path + "/StarRail-plugin"))
                return e.reply("....死开，你有这个插件？")
            if (/开启/.test(msg) && !SR.sr) {
                SR.sr = true
                cfg = cfg.replace('sr: false', 'sr: true')
            } else if (/关闭/.test(msg) && SR.sr) {
                SR.sr = false
                cfg = cfg.replace('sr: true', 'sr: false')
            }
        }
        await fs.promises.writeFile(_path + `/example/${sr_name}`, cfg, 'utf8')

        const miao = `喵喵：${SR.miao === true ? "开启" : "关闭"}`
        const sr_ = `星铁：${SR.sr === true ? "开启" : "关闭"}`
        e.reply(`当前状态：\n${miao}\n${sr_}`)
    }
}

/** 渲染数据 */
async function renderCard(e, data) {
    let renderData = {
        time: moment().format('YYYY-MM-DD HH:mm:ss dddd'),
        userName: e.sender.card || e.sender.nickname,
        ...data
    }
    const runtimeRender = (await import('../StarRail-plugin/common/runtimeRender.js')).default
    await runtimeRender(e, '/panel/new_card.html', renderData, {
        scale: 1.6
    })
}

/** 读取JSON文件 */
function readJson(file, root) {
    if (fs.existsSync(`${root}/${file}`)) {
        try {
            return JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'))
        } catch (e) {
            logger.error(e)
        }
    }
    return {}
}