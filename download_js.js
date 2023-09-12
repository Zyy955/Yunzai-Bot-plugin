import { exec } from "child_process"

export class download_js extends plugin {
    constructor() {
        super({
            name: '下载js',
            dsc: '下载js插件捏',
            event: 'message',
            priority: -1000,
            rule: [
                {
                    reg: /^#下载.*\.js.*/,
                    fnc: 'js',
                    permission: "master"
                }
            ]
        })
    }

    async js(e) {
        let url
        let name
        const msg = decodeURIComponent(e.msg).replace("#下载", "").trim().split('.js')
        if (msg[1]) {
            name = msg[1].trim().replace(".js", "")
            url = `curl -o "./plugins/example/${name}.js" "${msg[0]}.js"`
        } else {
            const urlParts = msg[0].split('/')
            name = urlParts[urlParts.length - 1].trim()
            url = `curl -o "./plugins/example/${name}.js" "${msg[0]}.js"`
        }
        console.log("🚀 ~ file: download_js.js:32 ~ download_js ~ js ~ url:", url)
        exec(url, { cwd: process.cwd() }, (err) => {
            if (err) return e.reply(`下载错误：${JSON.stringify(err)}`)
        })
        e.reply([segment.at(e.user_id), `\n插件 ${name}.js 下载完成~\n如果没有生效，请自行检查js的内容和云崽是否支持热加载~`], true)
    }
}

