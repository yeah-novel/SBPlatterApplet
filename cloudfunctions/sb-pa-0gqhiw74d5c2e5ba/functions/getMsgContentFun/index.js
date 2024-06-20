// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const Message = db.collection('chat_message')
  const _ = db.command
  const {classType, members, startTime, from_id} = event

  if(classType=='system'){
    return Message.where({
      to_id: wxContext.OPENID,
      from_id: 'system',
    }).orderBy('_id','desc').get()
  }else if(classType=='all'){
    return Message.where({
      to_id: 'all',
    }).orderBy('_id','desc').get()
  }
  return Message.where({
    from_id: _.in(members),
    to_id: _.in([from_id]),
    _id: _.gt(startTime),
  }).orderBy('_id','desc').get()
}