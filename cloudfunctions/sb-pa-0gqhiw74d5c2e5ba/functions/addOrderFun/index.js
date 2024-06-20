// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 发起拼桌，order_info表插入订单
exports.main = async (event, context) => {
  const db = cloud.database()
  return await db.collection('order_info').add({
    data: event.orderList
  })
}