// pages/message/message.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight:0,
    queueWatch: '',// 消息监听
    messageList:[], //消息列表
    sysMsgItem:{
      name:'系统消息',
      avatar:'/images/message/msg_icon.png',
      content:'暂无消息',
      time:'',
      class:'system',
    }, //系统消息
    showLoad:true,
    triggered:false, //下拉刷新是否被触发
  },

    /**
   * 生命周期函数
   */
  onLoad() {
    console.log("message onLoad")
  },
  onShow(){
    console.log("message onShow")
    this.handleMsgListData()
    this.handleSysMsg()
    this.handleWatch(true);
  },
  onReady(){
    console.log("message onReady")
  },
  onHide() {
    this.handleWatch(false)
  },
  /**
   * 下拉刷新
   */
  reloadData(){
    console.log("消息列表下拉刷新")
    this.handleSysMsg()
    this.handleMsgListData()
  },
  //删除消息
  deleteMessage(event){
    var {messageList} = this.data 
    let delIndex = event.detail.index; 
    const delInfo = messageList[delIndex]
    this.setData({ 
      messageList: messageList.splice(delIndex, 1) 
    }); 
    wx.cloud.callFunction({
      name:'delConnectFun',
      data:{
        from_id: delInfo.from_id
      },
      success: function(res){
        console.log("删除该聊天成功:",res)
      },
      fail:function(err){
        console.log("删除该聊天失败:",err)
      }
    })
   
  },
  //前往聊天界面
  toChatroom(event){
    let curIndex = event.detail.index
    const {messageList, myInfo, sysMsgItem} = this.data
    const curMessage = curIndex==-1? sysMsgItem:messageList[curIndex]
    wx.navigateTo({
      url: '/pages/message/chatroom/chatroom?' +
      'fromId=' + curMessage.from_id+ 
      '&type=' + curMessage.class + '&title=' + curMessage.name ,
    })
  },
  /**
   * 前往我的拼桌页面
   */
  jumpToMyOrder(){
    console.log("进入我的拼桌页面")
    wx.navigateTo({
      url: '/pages/message/myOrder/myOrderForm',
    })
  },
  /**
   * 前往嗨聊现场
   */
  toAllChatroom(){
    wx.navigateTo({
      url: '/pages/message/chatroom/chatroom?fromId=all&type=all&title=嗨聊现场' ,
    })
  },

  /**
   * 获取系统消息
   */
  handleSysMsg(){
    const {myInfo} = app.globalData
    let that = this
    const db = wx.cloud.database()
    db.collection('chat_message').where({
      from_id: 'system',
      to_id: myInfo._id
    }).orderBy('_id','desc').limit(1).get({
      success:function(res){
        console.log("message: 获取系统消息成功", res)
        const recond = res.data[0]
        const {_id, content} = recond
        that.setData({
          sysMsgItem: {
            avatar: '/images/message/msg_icon.png',
            class: 'system',
            content: content,
            name: '系统消息',
            time: _id,
          }
        })
      }
    })
  },
  handleMsgListData:function(){
    let that = this
    wx.cloud.callFunction({
      name:'getMsgListFun',
      data:{},
      success:function(res){
        console.log("获取消息列表:", res.result)
        that.setData({
          messageList: res.result.data,
          showLoad:false,
          triggered: false
        })
      },
      fail:function(err){
        that.setData({
          triggered: false
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
      }
    })
  },
  handleWatch: async function (watch) {
    let {queueWatch} = this.data
    const {myInfo} = app.globalData
    if(!myInfo._id || myInfo._id == '') return
    const db = wx.cloud.database()
    const _ = db.command
    const Message = db.collection('chat_connect')
    const that = this
    if (watch && !queueWatch) { // 监听
      queueWatch = Message.where({
        _openid: _.in([myInfo._id]),
        state:'enable',
      }).watch({// 发起监听
        onChange: function ({docs, docChanges}) {
          console.log("消息列表发生变化",docs)
          that.setData({
            messageList: docs
          })
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


})