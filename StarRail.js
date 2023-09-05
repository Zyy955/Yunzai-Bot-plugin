import fs from 'fs'
import _ from 'lodash'
import fetch from 'node-fetch'
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
                    reg: '^#星铁(?!插件)(?!更新)(.+)面板$',
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
    async update() {
        if (SR.miao) {
            ((await import("../miao-plugin/apps/profile/ProfileList.js")).default).refresh(this.e)
        }

        if (SR.sr) {
            const new_panel = new Panel()
            new_panel.e = this.e
            new_panel.reply = this.reply
            await new_panel.update(this.e)
        }
    }

    /** 查看角色详细面板 */
    async StarRail() {
        if (SR.miao) {
            ((await import("../miao-plugin/apps/profile/ProfileDetail.js")).default).detail(this.e)
        }

        if (SR.sr) {
            // const Panel = (await import("../StarRail-plugin/apps/panel.js")).Panel
            const new_panel = new Panel()
            new_panel.e = this.e
            new_panel.reply = this.reply
            await new_panel.panel(this.e)
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


/** 重写原始插件 放弃使用原绑定uid方法 */
let runtimeRender
let MysSRApi
let panelApi
let alias
let getSign
let getCk
let rulePrefix
let pluginResources
let pluginRoot
let setting
// 引入遗器地址数据
let relicsPathData
// 引入角色数据
let charData

if (fs.existsSync("./plugins/StarRail-plugin")) {
    runtimeRender = (await import("../StarRail-plugin/common/runtimeRender.js")).default
    MysSRApi = (await import("../StarRail-plugin/runtime/MysSRApi.js")).default
    panelApi = (await import('../StarRail-plugin/runtime/PanelApi.js')).default
    alias = (await import("../StarRail-plugin/utils/alias.js")).default
    getSign = (await import("../StarRail-plugin/utils/auth.js")).getSign
    getCk = (await import("../StarRail-plugin/utils/common.js")).getCk
    rulePrefix = (await import("../StarRail-plugin/utils/common.js")).rulePrefix
    pluginResources = (await import("../StarRail-plugin/utils/path.js")).pluginResources
    pluginRoot = (await import("../StarRail-plugin/utils/path.js")).pluginRoot
    setting = (await import("../StarRail-plugin/utils/setting.js")).default

    // 引入遗器地址数据
    relicsPathData = readJson('resources/panel/data/relics.json')
    // 引入角色数据
    charData = readJson('resources/panel/data/character.json')
}


export class Panel extends plugin {
    constructor(e) {
        super({
            name: '星铁兼容版',
            dsc: '星铁兼容版',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 50000,
            rule: []
        })
    }

    async panel(e) {
        const messageText = e.msg
        let messageReg = new RegExp(`^${rulePrefix}(.+)面板(更新)?`)
        const matchResult = messageText.match(messageReg)
        const charName = matchResult ? matchResult[4] : null
        if (!charName) return await this.plmb(e)
        if (charName === '更新' || matchResult[5]) return false
        if (charName === '切换' || charName === '设置') return await this.changeApi(e)
        if (charName.includes('参考')) return false
        /** 获取星铁uid */
        const uid = e?.user?.getUid('sr') || ""
        if (!uid) return e.reply("请先绑定星铁UID (^_−)☆")
        // await e.reply('正在获取面板数据中')
        try {
            const api = await panelApi()
            let data = await this.getCharData(charName, uid, e)
            data.uid = uid
            data.api = api.split('/')[2]
            data.charpath = charData[data.avatarId].path
            data.relics.forEach((item, i) => {
                data.relics[i].path = relicsPathData[item.id]?.icon
            })
            // 行迹
            data.behaviorList = this.handleBehaviorList(data.behaviorList)
            // 面板图
            data.charImage = this.getCharImage(data.name, data.avatarId)

            logger.debug(`${e.logFnc} 面板图:`, data.charImage)
            let msgId = await runtimeRender(
                e,
                '/panel/new_panel.html',
                data,
                {
                    retType: 'msgId',
                    scale: 1.6
                }
            )
            msgId &&
                redis.setEx(
                    `STAR_RAILWAY:panelOrigImg:${msgId.message_id}`,
                    60 * 60,
                    data.charImage
                )
        } catch (error) {
            logger.error('SR-panelApi', error)
            return await e.reply(error.message)
        }
    }

    /** 处理行迹 */
    handleBehaviorList(data) {
        let _data = _.cloneDeep(data)
        _data.splice(5)
        _data.forEach((item, i) => {
            const nameId = item.id.toString().slice(0, 4)
            let pathName = ''
            switch (i) {
                case 0:
                    pathName = 'basic_atk'
                    break
                case 1:
                    pathName = 'skill'
                    break
                case 2:
                    pathName = 'ultimate'
                    break
                case 3:
                    pathName = 'talent'
                    break
                case 4:
                    pathName = 'technique'
                    break
            }
            const filePath = nameId + '_' + pathName + '.png'
            _data[i].path = filePath
        })
        // 去除秘技
        return _data.filter(i => i.type != '秘技')
    }

    /** 获取面板图 */
    getCharImage(name, avatarId) {
        const folderPath = 'profile/normal-character/'
        const fullFolderPath = pluginResources + '/' + folderPath
        const folderPath1 = 'pro-file/pro-character/'
        const fullFolderPath1 = pluginResources + '/' + folderPath1
        const leadId = {
            星: [8002, 8004],
            穹: [8001, 8003]
        }
        _.forIn(leadId, (v, k) => {
            if (v.includes(avatarId)) name = k
        })
        this.config = setting.getConfig('PanelSetting')
        // 判断是否为群聊，并且群聊是否在限制名单中
        if (
            this.e.isGroup &&
            'no_profile' in this.config &&
            this.config.no_profile &&
            this.config.no_profile.includes(this.e.group_id)
        ) {
            // 返回默认图位置
            return `panel/resources/char_image/${avatarId}.png`
        }
        if (fs.existsSync(fullFolderPath1 + name) && Math.random() < 0.8) {
            return this.getRandomImage(folderPath1 + name)
        } else if (fs.existsSync(fullFolderPath + `${name}.webp`)) {
            return folderPath + `${name}.webp`
        } else if (fs.existsSync(fullFolderPath + name)) {
            return this.getRandomImage(folderPath + name)
        } else {
            // 返回默认图位置
            return `panel/resources/char_image/${avatarId}.png`
        }
    }

    /** 随机取文件夹图片 */
    getRandomImage(dirPath) {
        let _path = pluginResources + '/' + dirPath
        const files = fs.readdirSync(_path)
        const images = files.filter(file => {
            return /\.(jpg|png|webp)$/i.test(file)
        })
        const randomNum = Math.floor(Math.random() * images.length)
        return dirPath + '/' + images[randomNum]
    }

    async update(e) {
        /** 获取星铁uid */
        const uid = e?.user?.getUid('sr') || ""
        if (!uid) return e.reply("请先绑定星铁UID (^_−)☆")
        try {
            const api = await panelApi()
            const data = await this.getPanelData(uid, true)
            let renderData = {
                api: api.split('/')[2],
                uid,
                data,
                type: 'update'
            }
            // 渲染数据
            await renderCard(e, renderData)
            // await e.reply( '更新面板数据成功' );
            return false
        } catch (error) {
            logger.error('SR-panelApi', error)
            return await e.reply(error.message)
        }
    }

    // 查看API列表
    async apiList(e) {
        if (!e.isMaster) return await e.reply('仅限主人可以查看API列表')
        const apiConfig = setting.getConfig('panelApi')
        const defaultSelect = apiConfig.default
        const apiList = apiConfig.api
        let msg = 'API列表：\n'
        apiList.forEach((item, i) => {
            msg += `${i + 1}：${item.split('/')[2]}\n`
        })
        msg += `当前API：\n${defaultSelect}：${apiList[defaultSelect - 1].split('/')[2]}`
        await e.reply(msg)
    }

    // 切换API
    async changeApi(e) {
        if (!e.isMaster) return await e.reply('仅限主人可以切换API')
        const reg = /[1-9][0-9]*/g
        const match = reg.exec(e.msg)
        if (!match || match.length < 1) return await e.reply('请输入正确的API序号')
        let apiIndex = match[match.length - 1]
        try {
            apiIndex = parseInt(apiIndex) - 1
            // 获取API配置
            let apiConfig = setting.getConfig('panelApi')
            const apiList = apiConfig.api
            if (!apiList[apiIndex]) return await e.reply('请输入正确的API序号')
            apiConfig.default = apiIndex + 1
            setting.setConfig('panelApi', apiConfig)
            return await e.reply(
                `切换API成功，当前API：${apiList[apiIndex].split('/')[2]}`
            )
        } catch (error) {
            return await e.reply('切换API失败，请前往控制台查看报错！')
        }
    }

    /**
     * 获取角色数据
     * @param {string} name 角色名称
     * @param {number|string} uid 角色UID
     * @param e
     * @returns {Promise} 使用 try catch 捕获错误
     */
    async getCharData(name, uid, e) {
        const data = await this.getPanelData(uid, false, true)
        const charName = alias.get(name)
        const charInfo = data.filter(item => item.name === charName)[0]
        if (!charInfo) {
            const data = await this.getPanelData(uid, true)
            const charInfo = data.filter(item => item.name === charName)[0]
            if (!charInfo) {
                let realName = charName
                if (charName === false) {
                    realName = name
                }
                throw Error(
                    `未查询到uid：${uid} 角色：${realName} 的数据，请检查角色是否放在了助战或者展柜\n请检查角色名是否正确,已设置的会有延迟,等待一段时间后重试~`
                )
            }
            return charInfo
        }
        return charInfo
    }

    /**
     * 获取面板数据
     * @param {number|string} uid 角色UID
     * @param {boolean} isForce 是否强制更新数据
     * @returns {Promise} 使用 try catch 捕获错误
     */
    async getPanelData(uid, isForce = false, forceCache = false) {
        const timeKey = `STAR_RAILWAY:userPanelDataTime:${uid}`
        let previousData = await readData(uid)
        if ((previousData.length < 1 || isForce) && !forceCache) {
            logger.mark('SR-panelApi强制查询')
            await this.e.reply(`正在获取uid${uid}面板数据中~\n可能需要一段时间，请耐心等待`)
            try {
                logger.mark('SR-panelApi开始查询', uid)
                let time = await redis.get(timeKey)
                if (time) {
                    time = parseInt(time)
                    const leftTime = Date.now() - time
                    if (leftTime < 1 * 60 * 1000) {
                        const seconds = Math.ceil((1 * 60 * 1000 - leftTime) / 1000)
                        throw Error(`查询过于频繁，请${seconds}秒后重试~`)
                    }
                }
                const api = await panelApi()
                let res = null
                let cardData = null
                try {
                    res = await fetch(api + uid, {
                        headers: {
                            'x-request-sr': getSign(uid),
                            'library': 'hewang1an'
                        }
                    })
                    cardData = await res.json()
                } catch (error) {
                    logger.error(error)
                    throw Error(`UID:${uid}更新面板失败\n面板服务连接超时，请稍后重试`)
                }
                if (!res) throw Error(`UID:${uid}更新面板失败\n面板服务连接超时，请稍后重试`)
                // 设置查询时间
                await redis.setEx(timeKey, 360 * 60, Date.now().toString())
                if ('detail' in cardData) throw Error(cardData.detail)
                if (!('playerDetailInfo' in cardData)) {
                    throw Error(`uid:${uid}未查询到任何数据`)
                }
                if (!cardData.playerDetailInfo.isDisplayAvatarList) {
                    throw Error(`uid:${uid}更新面板失败\n可能是角色展柜未开启或者该用户不存在`)
                }
                const assistRole = cardData.playerDetailInfo.assistAvatar
                const displayRoles = cardData.playerDetailInfo.displayAvatars || []
                const findAssRoleInBehaRole = displayRoles.findIndex(
                    item => item.avatarId === assistRole.avatarId
                )
                let characters = []
                if (findAssRoleInBehaRole != -1) {
                    characters = displayRoles
                } else {
                    characters = [assistRole, ...displayRoles]
                }
                const chars = await updateData(previousData, characters)
                saveData(uid, chars)
                return chars
            } catch (error) {
                throw Error(error)
            }
        } else {
            // logger.mark('SR-panelApi使用缓存')
            const cardData = previousData
            return cardData
        }
    }

    async plmb(e) {
        let user = this.e.user_id
        let ats = e.message.filter(m => m.type === 'at')
        if (ats.length > 0 && !e.atBot) {
            user = ats[0].qq
        }
        /** 获取星铁uid */
        const uid = e?.user?.getUid('sr') || ""
        if (!uid) return e.reply("请先绑定星铁UID (^_−)☆")
        const api = await panelApi()
        const data = await this.getPanelData(uid, false)
        const lastUpdateTime = data.find(i => i.is_new && i.lastUpdateTime)?.lastUpdateTime
        let renderData = {
            api: api.split('/')[2],
            uid,
            data,
            time: moment(lastUpdateTime).format('YYYY-MM-DD HH:mm:ss dddd') ?? '该页数据为缓存数据，非最新数据'
        }
        // 渲染数据
        await renderCard(e, renderData)
    }

    async origImg(e) {
        if (!e.source) return false
        let source
        if (e.isGroup) {
            source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
        } else {
            source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
        }
        let ImgPath = await redis.get(
            `STAR_RAILWAY:panelOrigImg:${source.message_id}`
        )
        if (!ImgPath) return false
        let OP_setting = setting.getConfig('PanelSetting')
        if (OP_setting.originalPic || e.isMaster) {
            ImgPath = pluginResources + '/' + ImgPath
            if (!OP_setting.backCalloriginalPic) {
                // eslint-disable-next-line no-undef
                return e.reply(segment.image(ImgPath))
            } else {
                // eslint-disable-next-line no-undef
                return e.reply(segment.image(ImgPath), false, {
                    recallMsg: OP_setting.backCalloriginalPicTime
                })
            }
        }
        return e.reply('星铁原图功能已关闭，如需开启请联系机器人主人')
    }

    /** 通过米游社获取UID */
    async miYoSummerGetUid() {
        let key = `STAR_RAILWAY:UID:${this.e.user_id}`
        let ck = getCk(this.e)
        if (!ck) return false
        if (await redis.get(key)) return false
        let api = new MysSRApi('', ck)
        let userData = await api.getData('srUser')
        if (!userData?.data || _.isEmpty(userData.data.list)) return false
        userData = userData.data.list[0]
        let { game_uid: gameUid } = userData
        await redis.set(key, gameUid)
        await redis.setEx(
            `STAR_RAILWAY:userData:${gameUid}`,
            60 * 60,
            JSON.stringify(userData)
        )
        return userData
    }
}
/**
 * 替换老数据
 * @param {Array} oldData 老数据
 * @param {Array} newData 新数据
 * @returns {Promise} 使用 try catch 捕获错误
 */
async function updateData(oldData, newData) {
    let returnData = oldData
    // logger.mark('SR-updateData', oldData, newData);
    const handle = (name) => {
        return name === '{nickname}' || name === '{NICKNAME}' ? '开拓者' : name
    }
    oldData.forEach((oldItem, i) => {
        oldData[i].name = handle(oldData[i].name)
        oldData[i].relics = oldItem.relics || []
        oldData[i].behaviorList = oldItem.behaviorList || []
        oldData[i].is_new = false
    })
    newData.forEach((newItem, i) => {
        newData[i].is_new = true
        newData[i].name = handle(newData[i].name)
        newData[i].relics = newItem.relics || []
        newData[i].behaviorList = newItem.behaviorList || []
        // 最后更新时间
        newData[i].lastUpdateTime = Date.now()
        returnData = returnData.filter(
            oldItem => oldItem.avatarId != newItem.avatarId
        )
    })
    returnData.unshift(...newData)
    return returnData
}

const dataDir = pluginRoot + '/data/panel'

function saveData(uid, data) {
    // 判断目录是否存在，不存在则创建
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }
    try {
        fs.writeFileSync(`${dataDir}/${uid}.json`, JSON.stringify(data, null, '\t'), 'utf-8')
        return true
    } catch (err) {
        logger.error('写入失败：', err)
        return false
    }
}

function readData(uid) {
    // 文件路径
    const filePath = `${dataDir}/${uid}.json`
    // 判断文件是否存在并读取文件
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath))
    } else {
        return []
    }
}
/**
 * @description: 读取JSON文件
 * @param {string} path 路径
 * @param {string} root 目录
 * @return {object}
 */
function readJson(file, root = pluginRoot) {
    if (fs.existsSync(`${root}/${file}`)) {
        try {
            return JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'))
        } catch (e) {
            logger.error(e)
        }
    }
    return {}
}

async function renderCard(e, data) {
    let renderData = {
        time: moment().format('YYYY-MM-DD HH:mm:ss dddd'),
        userName: e.sender.card || e.sender.nickname,
        ...data
    }
    await runtimeRender(e, '/panel/new_card.html', renderData, {
        scale: 1.6
    })
}
