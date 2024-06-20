// pages/index/tableDetail/tableDetail.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myInfo:{},
    pageHeight:0,
    tableInfo:{},
    isIn:false,//是否已加入该拼桌
    queueWatch: '',// 消息监听
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    console.log("tableDetail onLoad")
    var screenHeight = app.globalData.screenHeight
    const tableInfo =  JSON.parse(options.tableInfo)
    this.setData({
      tableInfo : tableInfo,
      pageHeight: screenHeight + 130,
      myInfo: app.globalData.myInfo
    })
  },
  onShow() {
    console.log("tableDetail onShow")
    const {tableInfo} = this.data
    const isIn = this.checkIsInOrder(tableInfo)
    this.setData({
      isIn: isIn
    })
    this.handleWatch(true)
  },
  onHide() {
    console.log("tableDetail onHide")
    this.handleWatch(false)
  },
  checkIsInOrder(tableInfo){
    const {myInfo} = app.globalData
    if(!myInfo._id || !tableInfo._id) return false
    for( var index in tableInfo.members){
      if(tableInfo.members[index]._id == myInfo._id){
        return true
      }
    }
    return false
  },
  /**
   * 进入群聊页面
   */
  navigateToChatroom(){
    const {tableInfo} = this.data
    const {myInfo} = app.globalData
    const name = tableInfo.tableNo + "桌的群聊"
    const db = wx.cloud.database()
    db.collection('chat_connect').where({
      from_id: tableInfo._id,
      _openid: myInfo._id,
    }).update({
      data:{
        state:"enable"
      },
      success:function(res){
        console.log("进入群聊", res)
        wx.navigateTo({
          url: '/pages/message/chatroom/chatroom?' +
                'fromId=' + tableInfo._id + 
                '&type=group' + '&title=' + name ,
        })
      }
    })
  },
  /**
   * 退出拼桌
   */
  leaveFromTable(){
    wx.showToast({
      title: '退出拼桌...',
      icon: 'loading',
      mask: true,
    })
    let that = this
    const {tableInfo} = this.data
    const {myInfo} = app.globalData
    for(var index in tableInfo.members){
      if(tableInfo.members[index]._id==myInfo._id){
        tableInfo.members.splice(index,1)
        break
      }
    }
    console.log(tableInfo.members)
    wx.cloud.callFunction({
      name:'delUserFromOrder',
      data:{
        _id: tableInfo._id,
        members: tableInfo.members
      },
      success:function(res){
        console.log("退出拼桌",res)
        if(res.result.stats.removed==0){
          wx.showToast({
            title: '拼桌已完成',
            icon: 'error',
          })
          return
        }
        wx.navigateBack({delta: 1})
        const content = "您已退出" + tableInfo.tableNo + "号桌的拼桌" 
        that.sendSysMsg(myInfo, content)
        that.delConnect(tableInfo._id)
        //群处退桌
        if(index==0 && tableInfo.members.length>0){
          that.sendRemoteMsg(tableInfo)
        }
      }
    })
  },
  //消息推送
  sendRemoteMsg(tableInfo){
    wx.cloud.callFunction({
      name:'sendRemoteMsg',
      data:{
        time: tableInfo.time,
        userId: tableInfo.members[0]._id
      },
      success(res){
        console.log("推送消息成功", res)
      },
      fail(err){
        console.log("推送消息失败", err)
      }
    })
  },
  delConnect(tableId){
    const {myInfo} = app.globalData
    const db = wx.cloud.database()
    const Connect = db.collection('chat_connect')
    Connect.where({
      from_id: tableId,
      _openid: myInfo._id
    }).remove({
      success: function(res){
        console.log("从拼桌群聊中移除")
      },
      fail: function(err){
        console.log("从拼桌群聊中移除失败")
      }
    })
  },
  /**
   * 确认拼桌
   */
  confirmPZ(){
    const {tableInfo} = this.data
    
    wx.showModal({
      title: '拼桌确认',
      content: '请确认拼桌是否成功',
      cancelText:'取消',
      confirmText:'完成',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          wx.cloud.callFunction({
            name:'updateOrderStateFun',
            data:{
              orderId: tableInfo._id
            },
            success(res){
              console.log(res)
            },
            fail(err){
              console.log(err)
              wx.showToast({
                title: '确认失败，请重试',
                icon: 'error'
              })
            }
          })
        }
      },
      fail(err){
        console.log(err)
        wx.showToast({
          title: '确认失败，请重试',
          icon: 'error',
        })
      }
    })
  },
  /**
   * 加入拼桌
   */
  addToTable(){
    wx.showToast({
      title: '加入拼桌...',
      icon: 'loading',
      mask: true,
    })
    let that = this
    const {tableInfo} = this.data
    const {myInfo} = app.globalData
    const orderId = tableInfo._id
    if(!myInfo._id || myInfo._id == '') {
      wx.showToast({
        title: '加入拼桌失败',
        icon: 'error',
      })
      return
    }
    if(tableInfo.members.length >= tableInfo.upNum){
      wx.showToast({
        title: '人员已满',
        icon: 'error',
      })
      return
    }
    if(this.checkIsInOrder(myInfo, tableInfo)){
      wx.showToast({
        title: '加入拼桌失败',
        icon: 'error',
      })
      return
    }
    if((myInfo.gender=='fmale' && tableInfo.gender=='仅限男生')||(myInfo.gender=='male' && tableInfo.gender=='仅限女生')){
      wx.showToast({
        title: '不符合拼桌条件',
        icon: 'error',
      })
      return
    }
    myInfo.state = 0
    wx.cloud.callFunction({
      name:'addUserToOrder',
      data:{
        user: myInfo,
        _id: orderId ,
        upNum: tableInfo.upNum
      },
      success:function({result}){
        console.log("您已加入拼桌:",result)
        if(result.stats.updated==0){
            wx.showToast({
              title: '加入拼桌失败',
              icon: 'error',
            })
        }else{
          wx.showToast({
            title: '加入拼桌成功',
            icon: 'success',
          })
          that.setData({
            isIn: true
          })
          const content = "您已加入" + tableInfo.tableNo + "号桌的拼桌" 
          that.sendSysMsg(myInfo, content)
          that.addToTableChat(myInfo, tableInfo)
          wx.requestSubscribeMessage({
            tmplIds: ['nkMJ7qtnv9xJN3oiLTWDibFbKNPC537dt_G75mND6q4'],
            success(res){
              console.log(res)
              wx.cloud.callFunction({
                name:'sendRemoteMsg',
                success(res){
                  console.log("推送消息", res)
                },
                fail(err){
                  console.log("推送消息", err)
                }
              })
            },
            fail(err){
              console.log(err)
            }
          })
        } 
      },
      fail:function (err) {
        console.log("加入拼桌失败", err)
        wx.showToast({
          title: '加入拼桌失败',
          icon: 'error',
        })
      }
    })
  },
  /**
   * 加入进入桌聊页面
   */
  addToTableChat(myInfo, tableInfo){
    var timeStamp = Date.parse(new Date());  
    timeStamp = timeStamp / 1000;
    const db = wx.cloud.database()
    const Connect = db.collection('chat_connect')
    Connect.add({
      data:{
        from_id: tableInfo._id, 
        avatar: '', 
        name: tableInfo.tableNo+"号桌的群聊", 
        time: timeStamp, 
        content: "你已加入"+ tableInfo.tableNo+"号桌的群聊", 
        hasUnread: true, 
        class: 'group', 
        state: 'enable', 
      },
      success:function(res){
        console.log("进入群聊成功", res)
        const name = tableInfo.tableNo + "桌的群聊"
        wx.navigateTo({ 
          url: '/pages/message/chatroom/chatroom?' +
          'fromId=' + tableInfo._id + 
          '&type=group' + '&title=' + name ,
        }) 
      },
      fail:function(err){
        console.log("进入群聊失败", err)
      }
    })
  },
  /**发送系统消息 */
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
  handleWatch: async function (watch) {
    let {queueWatch, tableInfo} = this.data
    if(!tableInfo._id) return
    const db = wx.cloud.database()
    const _ = db.command
    const Message = db.collection('order_info')
    const that = this
    if (watch && !queueWatch) { // 监听
      queueWatch = Message.where({
        _id: tableInfo._id,
        state: 1,
      }).orderBy('time', 'desc').watch({// 发起监听
        onChange: function ({docs, docChanges}) {
          console.log("拼桌成员发生变化", docs)
          if(docs.length>0){
            that.setData({
              tableInfo: docs[0],
            })
          } 
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
      this.setData({ queueWatch })
    } else if (!watch && queueWatch) { // 取消监听
      await queueWatch.close()
      this.setData({ queueWatch: '' })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})