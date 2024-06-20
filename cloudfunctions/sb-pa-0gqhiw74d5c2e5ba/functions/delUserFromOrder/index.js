// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 用户退出拼桌
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const members = event.members
  const db = cloud.database()
  if(members.length>0){
    return db.collection('order_info').where({
      _id: event._id,
      state: 1,
    }).update({
      data:{
        members: members,
        addNum: members.length
      }
    })
  }
  return db.collection('order_info').where({
    _id: event._id,
    state: 1,
  }).remove()
}