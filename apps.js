import './lib/config/init.js'
import ListenerLoader from './lib/listener/loader.js'
import PluginsLoader from './lib/plugins/loader.js'
import { Client } from 'icqq'
import cfg from './lib/config/config.js'

export default class Yunzai extends Client {
    // eslint-disable-next-line no-useless-constructor
    constructor(conf) {
        super(conf)
    }

    /** 登录机器人 */
    static async run() {
        const bot = new Yunzai(cfg.bot)
        /** 加载icqq事件监听 */
        await ListenerLoader.load(bot)
        /** 造个假~! */
        bot.uin = "88888"
        return bot
    }
}

/** 全局变量 bot */
global.Bot = await Yunzai.run()

/** 加载插件... */
await PluginsLoader.load()