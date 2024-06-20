// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 更新用户头像
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  return db.collection('user_info').where({
    _id: wxContext.OPENID,
  }).update({
    data:{
      avatar: event.avatar
    }
  })
}