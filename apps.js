import fs from 'node:fs'
import { Client } from 'icqq'
import cfg from './lib/config/config.js'
import setLog from './lib/config/log.js'
import redisInit from './lib/config/redis.js'
import { checkRun } from './lib/config/check.js'
import ListenerLoader from './lib/listener/loader.js'

/** 设置标题 */
process.title = 'Miao-Yunzai'

async function UpdateTitle() {
    // 添加一些多余的标题内容
    let title = 'Miao-Yunzai'
    /** 设置标题 */
    process.title = title
}

/** 设置时区 */
process.env.TZ = 'Asia/Shanghai'

/** 捕获未处理的Promise错误 */
process.on('unhandledRejection', (error, promise) => {
    let err = error
    if (logger) {
        logger.error(err)
    } else {
        console.log(err)
    }
})

/** 退出事件 */
process.on('exit', async (code) => {
    if (typeof redis != 'undefined' && typeof test == 'undefined') {
        await redis.save()
    }
})

await checkInit()

/** 初始化事件 */
async function checkInit() {
    /** 检查node_modules */
    if (!fs.existsSync('./node_modules') || !fs.existsSync('./node_modules/icqq')) {
        console.log('请先运行命令：pnpm install -P 安装依赖')
        process.exit()
    }

    /** 日志设置 */
    setLog()

    logger.mark('Miao-Yunzai 启动中...')

    await redisInit()

    await checkRun()

    //** 更新标题 */
    await UpdateTitle()
}

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
await ((await import('./lib/plugins/loader.js')).default).load()
