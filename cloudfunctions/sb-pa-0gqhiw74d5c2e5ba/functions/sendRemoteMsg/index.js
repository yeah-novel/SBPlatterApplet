// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 消息推送
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.time == '现场') return
  const timeStamp = getTime(event.time)
  const userId = event.userId
  const tip = '请在18:00前确认拼桌是否成功'
  const state = wxContext.OPENID == userId? '发起拼桌':'成为群主'
  //发送订阅消息
  try{
    const result = await cloud.openapi.subscribeMessage.send({
      touser: userId,
      page: '/pages/index/index',
      data:{
        thing6:{
          value: '叁人乐·拼桌馆',
        },
        date3:{
          value: timeStamp,
        },
        phrase26:{
          value: state,
        },
        thing8:{
          value: tip,
        }
      },
      templateId:'nkMJ7qtnv9xJN3oiLTWDibFbKNPC537dt_G75mND6q4',
      miniprogramState:'trial'
    })
    return result
  }catch(err){
    return err
  }
}

function getTime(timeStr) {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()+1
  const day = date.getDate()
  const hour = date.getHours()+8
  const minute = date.getMinutes()
  return timeStr==''? year + '年' + month + '月' + day + '日 ' + hour + ':' + minute : year + '年' + month + '月' + day + '日 ' + timeStr
}