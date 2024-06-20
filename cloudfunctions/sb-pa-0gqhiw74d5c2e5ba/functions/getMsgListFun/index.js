// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 获取消息列表
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  return await db.collection('chat_connect').where({
    _openid:wxContext.OPENID,
    state:'enable',
  }).orderBy('time','desc').get()
}