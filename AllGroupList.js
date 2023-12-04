import { Cfg } from '#miao'

const ProfileRank = (await import("../miao-plugin/models/ProfileRank.js")).default
ProfileRank.getGroupUidList = async function (groupId, charId, type = 'mark') {
    let number = Cfg.get('rankNumber', 15)

    let groupList = await redis.keys('miao:rank:*')
    groupList = groupList.map(key => {
        const parts = key.split(':')
        return parts[2]
    })

    let uids = []
    for (let i of groupList) {
        uids.push(...await redis.zRangeWithScores(`miao:rank:${i}:${type}:${charId}`, -`${number}`, -1))
    }
    /** 去重 */
    uids = Array.from(new Set(uids.map(JSON.stringify))).map(JSON.parse)
    /** 重新排序 */
    uids.sort((a, b) => b.score - a.score)
    /** 只取100个 */
    if (uids.length > 100) uids.splice(100)
    return uids ? uids.reverse() : false
}