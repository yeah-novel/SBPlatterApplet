// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 退桌后删除拼桌群聊
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  return db.collection('chat_connect').where({
    from_id: event.from_id,
    _openid: wxContext.OPENID
  }).update({
    data:{
      state:'disable',
    }
  })
}