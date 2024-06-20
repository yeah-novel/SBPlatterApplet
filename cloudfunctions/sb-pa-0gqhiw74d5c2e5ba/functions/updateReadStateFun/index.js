// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const {from_id} = event
  const _ = db.command
  return db.collection('chat_connect').where({
      class:'group',
      from_id: from_id
    }
  ).update({
    data:{
      hasUnread: false,
    }
  })
}