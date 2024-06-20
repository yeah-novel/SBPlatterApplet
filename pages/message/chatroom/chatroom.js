// pages/message/chatroom/chatroom.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classType: 'onebyone', //group-群聊，onebyone，all-聊天大厅, system-系统消息
    fromId:'',
    myInfo:{},
    members:[], //聊天室成员
    InputBottom: 0,
    toInfo: {}, //接受者信息
    queueWatch: '',// 消息监听
    content: '', // 发送内容
    messageList: [], // 聊天信息
    contentType :"text",
    showLoad:true,  //  显示加载
    showImage: '', //显示图片
    showDialog: true, //显示遮罩
    scrollTo:'',//scroll-view底部
    startTime:0,//群聊开始时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("chatroom onLoad", options)
    const {type, title, fromId} = options
    this.setData({
      myInfo: app.globalData.myInfo,
      fromId: fromId,
      classType: type,
      toInfo: {
        from_id: fromId,
        avatar:"",
        name: title,
        class: type
      }
    })
    wx.setNavigationBarTitle({
      title: title,
    })
  },
  onShow() {
    console.log("chatroom onShow")
    const {fromId, classType} = this.data
    if(classType=='group') this.getChatroomMembers(fromId)
    else {
      this.handleChatContentData({})
    }
    this.hasReadMsg()
  },
  onHide() {
    console.log("chatroom onUnload")
    this.handleWatch(false) // 取消监听
  },
  onUnload(){
    console.log("chatroom onUnload")
  },
  /**
   * 监听输入消息
   */
  handleInput(e){
    this.setData({
      content: e.detail.value
    })
  },
  hasReadMsg(){
    console.log("该聊天已读")
    const {fromId, classType} = this.data
    if(classType=='all') {
      return
    }
    wx.cloud.callFunction({
      name:'updateReadStateFun',
      data:{
        from_id: fromId,
      },
      success: function(res){
        console.log("消息已读")
      }
    })
  },
  getChatroomMembers(fromId){
    console.log(fromId)
    let that = this
    const db = wx.cloud.database()
    const Order = db.collection('order_info')
    Order.where({
      _id: fromId,
    }).get({
      success:function(res){
        console.log("获取chatroom的成员成功",res.data)
        const order = res.data[0]
        if(order.members.length==0){
          wx.showToast({
            title: '该群聊不存在',
            icon: 'error',
          })
          return
        }
        console.log(order)
        that.setData({
          members: order.members,
          startTime: order.create_time
        })
        that.handleChatContentData(order);
        that.handleWatch(true)
      },
      fail:function(err){
        console.log("获取chatroom的成员失败", err)
        that.setData({
          showLoad:false,
          showDialog: false,
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
      }
    })
  },
  addImage(){
    let that = this
    wx.chooseMedia({
      count : 1,
      mediaType : ['image', 'video'],
      sourceType : ['album', 'camera'],
      maxDuration : 30,
      camera : 'back',
      success : res => {
        const tmpPath = res.tempFiles[0].tempFilePath
        console.log(tmpPath)
        that.upAvatar(tmpPath)
      }
    })
  },
  upAvatar(tmpPath){
    var that = this
    var timeStamp = Date.parse(new Date());  
	  timeStamp = timeStamp / 1000;  
    wx.cloud.uploadFile({
      cloudPath : "chatImage/" + timeStamp +".jpg",
      filePath: tmpPath,
    })
    .then(res =>{
      console.log("上传头像成功",res.fileID)
      that.setData({
        contentType: 'image',
        content: res.fileID
      })
      that.sendMsg()
    })
  },
  handleChatContentData(order){
    const {fromId, classType} = this.data
    var memberIds = []
    if(classType=='group'){
      memberIds = order.members.map((item)=>{
        return item._id
      })
    }
   
    let that = this
    console.log(classType)
    wx.cloud.callFunction({
      name:'getMsgContentFun',
      data:{
        from_id : fromId,
        classType: classType,
        members: classType=='group'? memberIds:[],
        startTime: classType=='group'? order.create_time:0
      },
      success:function(res){
        const records = res.result.data.reverse()
        console.log("获取聊天记录成功", records)
        that.setData({
          messageList: records,
          showLoad:false,
          showDialog:false,
          scrollTo : 'msg-'+ (records.length-1),
        })
        that.handleWatch(true)
      },
      fail:function(err){
        console.log("获取聊天记录失败",err)
        that.setData({
          showLoad:false,
          showDialog: false,
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
      }
    })
  },
  //创建聊天
  sendMsg(){
    let that = this
    const {toInfo, content, contentType,classType} = this.data
    const {myInfo} = app.globalData
    if(content=="" || !content){
      wx.showToast({
        title: '发送内容不能为空',
        icon: 'error'
      })
      return
    }
    if(!toInfo.from_id || !myInfo._id){
      wx.showToast({
        title: '发送失败',
        icon: 'error'
      })
      return
    }
    var timeStamp = Date.parse(new Date());  
	  timeStamp = timeStamp / 1000;  
    const message = {
      _id: timeStamp,
      from_id : myInfo._id,
      from_name : myInfo.nickname,
      from_avatar : myInfo.avatar,
      to_id : toInfo.from_id,
      to_name : toInfo.name,
      content:  content,
      content_type: contentType,
      class: classType,
      isread: false,
    }
    const db = wx.cloud.database()
    const Message = db.collection('chat_message')
    Message.add({
      data: message,
      success: function(res){
        console.log("发送消息成功", res)
        that.setData({
          content:"",
          contentType:'text',
        })
        if(classType=='all') return
        that.updateConnectData(message, contentType)
      },
      fail:function(err){
        console.log("发送消息失败", err)
        wx.showToast({
          title: '发送失败',
          icon: 'error',
        })
        that.setData({
          content:"",
          contentType:'text',
        })
      }
    })
  },
  //更新消息列表的数据
  updateConnectData(message, contentType){
    wx.cloud.callFunction({
      name:'updateConnectFun',
      data:{
        from_id: message.to_id,
        content: contentType=='image'? '图片':message.content,
        time: message.time,
        hasUnread: true,
        state: 'enable',
      },
      success:function(res){
        console.log("有最新消息")
      }
    })
  },
  handleWatch: async function (watch) {
    let {queueWatch, fromId, classType, members, startTime} = this.data
    const {myInfo} = app.globalData
    if(!myInfo._id || myInfo._id == '') return
    if(classType=='group'){
      var memberIds = members.map((item)=>{
        return item._id
      })
    }
    const db = wx.cloud.database()
    const _ = db.command
    const Message = db.collection('chat_message')
    const that = this
    var MessageData
    if(classType == 'system'){
      MessageData = Message.where({
        to_id: myInfo._id,
        from_id: 'system',
      }).orderBy('time', 'asc')
    }else if(classType=='all'){
      MessageData = Message.where({
        to_id: 'all'
      }).orderBy('time', 'asc')
    }else if(classType=='group'){
      console.log(memberIds, fromId)
      MessageData = Message.where({
        from_id: _.in(memberIds),
        to_id: fromId,
        _id: _.gt(startTime)
      }).orderBy('time', 'asc')
    }else{
      MessageData = Message.where({
        from_id: _.in([myInfo._id, fromId]),
        to_id: _.in([myInfo._id, fromId])
      }).orderBy('time', 'asc')
    }
    if (watch && !queueWatch) { // 监听
      queueWatch = MessageData.watch({
        onChange: function ({docs}) {
          const records = docs.sort((a,b)=>{
           return a._id - b._id
          })
          console.log("聊天记录发生变化", records)
          that.setData({
            messageList: records
          })
          that.setData({
            scrollTo : 'msg-'+ (records.length-1),
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
  InputFocus({ detail: { height } }) {
    this.setData({ InputBottom: height })
  },
  InputBlur(e) {
    this.setData({ InputBottom: 0 })
  },
  showImage(e){
    console.log(e.currentTarget.dataset.src)
    this.setData({
      showDialog:true,
      showImage: e.currentTarget.dataset.src,
    })
  },
  onClickHide(){
    this.setData({
      showDialog:false,
      showImage: '',
      showLoad: false,
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
})