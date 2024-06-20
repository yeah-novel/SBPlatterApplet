// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 用户加入拼桌
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database() 
  const user = event.user 
  const _ = db.command
  return await db.collection('order_info').where({ 
    _id: event._id,
    addNum: _.lt(event.upNum),
    state: 1, 
  }).update({ 
    data:{ 
      members:_.addToSet(user),
      addNum: _.inc(1)
    }, 
  }) 
}