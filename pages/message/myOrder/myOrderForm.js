// pages/message/myOrder/myOrderForm.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[], //我的拼桌
    queueWatch: '',// 消息监听,
    myInfo: {},
    showLoad:true,
    triggered:false, //下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      myInfo: app.globalData.myInfo
    })
    this.getMyOrder()
    this.handleWatch(true)
  },
  onHide() {
    this.handleWatch(false)
  },
  onUnload() {

  },
  reloadData(){
    console.log("myOrderFrom 下拉刷新")
    this.getMyOrder()
  },
  /**
   * 退出拼桌
   */
  leaveFromTable(event){
    let that = this
    console.log(event.detail.order)
    const order = event.detail.order
    const {myInfo} = app.globalData
    if(!myInfo._id) return
    for(var index in order.members){
      if(order.members[index]._id==myInfo._id){
        order.members.splice(index,1)
      }
    }
    console.log(order.members)
    wx.cloud.callFunction({
      name:'delUserFromOrder',
      data:{
        tableNo: order.tableNo,
        members: order.members
      },
      success:function(res){
        console.log("退出拼桌")
        const content = "您已退出" + order.tableNo + "号桌的拼桌" 
        that.sendSysMsg(myInfo, content)
        that.delConnect(myInfo, order)
      }
    })
  },
  delConnect(myInfo, order){
    const db = wx.cloud.database()
    const Connect = db.collection('chat_connect')
    var _id = order._id
    Connect.where({
      from_id:_id,
      _openid: myInfo._id
    }).remove({
      success: function(res){
        console.log("从拼桌群聊中移除",res)
      },
      fail: function(err){
        console.log("从拼桌群聊中移除失败")
      }
    })
  },
  sendSysMsg(myInfo, content){
    const timeStamp = Date.parse(new Date()) / 1000
    const message = {
      _id: timeStamp,
      from_id:"system",
      from_name: "系统消息",
      from_avatar:"/images/message/msg_icon.png",
      to_id: myInfo._id,
      to_name: myInfo.nickname,
      content: content,
      content_type: "text",
      class: "system",
      isread: false,
    }
    const db = wx.cloud.database()
    const Message = db.collection('chat_message')
    Message.add({
      data : message
    }).then(res=>{
      console.log("发送退出拼桌的消息")
    })
  },
  /**
   * 获取我的拼桌数据
   */
  getMyOrder(){
    const {myInfo} = this.data
    if(!myInfo._id) return
    let that = this
    const db = wx.cloud.database()
    const Order = db.collection('order_info')
    const _ = db.command
    Order.where({
      members: _.elemMatch({
        _id: myInfo._id
      }),
    }).orderBy('create_time', 'desc').limit(20).get({
      success:function({data}){
        console.log("我的订单:", data.length)
        that.setData({
          orderList: data.reverse(),
          showLoad:false,
          triggered: false,
        })
      },
      fail:function(err){
        console.log("获取失败", err)
        that.setData({
          showLoad:false,
          triggered: false,
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
      }
    })
  },
  handleWatch: async function (watch) {
    let {queueWatch,myInfo} = this.data
    if(!myInfo._id || myInfo._id == '') return
    const db = wx.cloud.database()
    const _ = db.command
    const Order = db.collection('order_info')
    const that = this
    if (watch && !queueWatch) { // 监听
      queueWatch = Order.where({
        members: _.elemMatch({
          _id: myInfo._id
        }),
      }).orderBy('create_time','desc').limit(20).watch({
        // 发起监听
        onChange: function ({docs}) {
          console.log("我的订单:", docs)
          that.setData({
            orderList: docs.reverse()
          })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
          that.handelinitData()
        }
      })
      this.setData({ queueWatch })
    } else if (!watch && queueWatch) { // 取消监听
      await queueWatch.close()
      this.setData({ queueWatch: '' })
    }
  } 
})