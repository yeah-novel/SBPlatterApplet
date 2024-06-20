// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext() 
  const db = cloud.database() 
  return await db.collection('user_info').add({ 
    data:{ 
      _id: wxContext.OPENID, 
      nickname: event.nickname, 
      avatar: event.avatar, 
      gender: event.gender, 
      // age: event.age, 
      constellation: event.constellation 
    } 
  }) 
}