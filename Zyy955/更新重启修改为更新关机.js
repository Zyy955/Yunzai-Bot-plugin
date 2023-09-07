/** 自用... */

import { update } from "../other/update.js"

update.prototype.restart = async function () {
    this.e.reply("哒哒哒，你的重启被我吃啦~现在开始关机哦^_^")
    return process.exit()
}