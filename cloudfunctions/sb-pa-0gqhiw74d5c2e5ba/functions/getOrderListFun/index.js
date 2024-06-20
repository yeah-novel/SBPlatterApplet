// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 获取拼桌列表
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const {gtTime, ltTime} = event
  return db.collection('order_info').where({
    create_time: _.and(_.gt(gtTime), _.lt(ltTime)),
  }).orderBy('tableNo', 'asc').get()
}