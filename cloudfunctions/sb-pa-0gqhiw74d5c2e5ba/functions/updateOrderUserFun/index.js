// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 用户已到店，更新订单
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  return db.collection('order_info').where({
    _id : event.orderId,
    state: 1,
  }).update({
    data:{
      members: event.members
    }
  })
}