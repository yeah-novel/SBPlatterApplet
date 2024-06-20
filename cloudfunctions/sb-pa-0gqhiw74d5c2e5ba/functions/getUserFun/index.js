// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openId = wxContext.OPENID
  const db = cloud.database()
  let record = await db.collection('user_info').where({
    _id: openId
  }).get()
  return {
    userInfo:record,
    openId : openId 
  }
}