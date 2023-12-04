/**
 * 仓库：https://github.com/Zyy955/Yunzai-Bot-plugin
 * gitee：https://gitee.com/Zyy955/Yunzai-Bot-plugin
 */
import { Cfg } from '#miao'

/** 设置显示排名数量，不推荐过大，默认100 */
const num = 100

const ProfileRank = (await import("../miao-plugin/models/ProfileRank.js")).default
ProfileRank.getGroupUidList = async function (groupId, charId, type = 'mark') {
    let number = Cfg.get('rankNumber', 15)

    let groupList = await redis.keys('miao:rank:*')
    groupList = groupList.map(key => {
        const parts = key.split(':')
        return parts[2]
    })

    let promises = groupList.map(i => redis.zRangeWithScores(`miao:rank:${i}:${type}:${charId}`, -`${number}`, -1))
    let results = await Promise.all(promises)

    let uids = []
    for (let result of results) {
        uids.push(...result)
    }
    /** 去重 */
    uids = Array.from(new Set(uids.map(JSON.stringify))).map(JSON.parse)
    /** 二次去重 */
    uids = uids.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.value === item.value && t.score === item.score
        ))
    )
    /** 重新排序 */
    uids.sort((a, b) => b.score - a.score)
    /** 只取100个 */
    if (uids.length > Number(num)) uids.splice(Number(num))
    return uids ? uids.reverse() : false
}