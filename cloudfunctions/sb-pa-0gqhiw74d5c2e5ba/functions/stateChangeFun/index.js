// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const result = await db.collection('order_info').where({
    state:1,
  }).update({
    data:{
      state:0
    },
  })
  await db.collection('chat_connect').where({
    state: 'enable'
  }).update({
    data:{
      state: 'disable'
    }
  })
  return result
}