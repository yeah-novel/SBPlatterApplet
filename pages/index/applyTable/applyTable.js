// pages/index/applyTable/applyTable.js
var app = getApp()
const timePicker = {
  时: ['20时', '21时', '22时', '23时', '24时', '01时'],
  分: ['00分', '10分', '20分', '30分', '40分', '50分'],
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight:0,
    type:'', //live-现场发起， book-预约发起
    tableNo:'',
    value1: 0,
    theme:'',
    time:'现场',
    upNum:1,
    gender:'男女不限',
    payment:'AA',
    totalNum:1,
    store: '01', //门店号
    tableList: [{ text: '桌号', value: 0 },],
    queueWatch: '',// 消息监听
    showTimePicker: false, //日期选择器
    timeCell:[{
      values: timePicker['时'],
      className: 'column1',
      defaultIndex: 2,
    },
    {
      values: timePicker['分'],
      className: 'column2',
      defaultIndex: 2,
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTables()
    var screenHeight = app.globalData.screenHeight;
    this.setData({
      pageHeight : screenHeight + 100,
      type: options.type
    })
  },
  onReady() {
    console.log("applyTable: onReady")
  },
  onShow() {
    console.log("applyTable: onShow")
    const {type} = this.data
    this.setData({
      time: type=='book'?'20:00':'现场'
    })
    this.handleWatch(true)
  },
  onHide() {
    console.log("applyTable: onHide")
    this.handleWatch(false)
  },
  onUnload() {
    console.log("applyTable: onUnload")
  },
  onPullDownRefresh() {
    console.log("applyTable: onPullDownRefresh")
  },
  onReachBottom() {
    console.log("applyTable: onReachBottom")
  },
  onShareAppMessage() {
    console.log("applyTable: onShareAppMessage")
  },
  /**
   * 获取可申请桌号列表
   */
  getTables(){
    var tables=app.globalData.tableInfo
    var tableList=[{ text: '桌号', value: 0, icon:''}]
    const db = wx.cloud.database()
    const table = db.collection('order_info')
    table.where({state:1}).orderBy('tableNo','asc').get({
      success: ({ data }) => {
        console.log("applyTable: getTables successfully")
        var cells=[]
        for(var i=0;i<data.length;i++){
        var cell=new Object()
        cell['tableNo']=data[i].tableNo
        cell['upNum']=data[i].upNum
        cells.push(cell)
        }
        for (var i = 0; i < tables.length; i++) {
          for (var j = 0; j < cells.length; j++) {
            if (tables[i].tableNo== cells[j].tableNo) {
              tables.splice(i, 1);
              i=i-1;
            }
          }
        }
        for(var i=0;i<tables.length;i++){
          var list=new Object()
          list['text']=tables[i].tableNo+'('+tables[i].upNum.toString()+'人桌'+')'
          list['value']=i+1
          list['icon'] = ''
          tableList.push(list)
        }
        this.setData({
          tableList:tableList
        })
       },
      fail:function(err){
        console.log("applyTable: getTables failed")
      }
    })   
  },
  /**
   *  选择桌号 
   */
  changeTableNo(e){
    var upNum=0
    var tables=app.globalData.tableInfo
    for(var i=0;i<tables.length;i++){
      if(tables[i].tableNo==this.data.tableList[e.detail].text.substring(0,2)){
        upNum=tables[i].upNum
      }
    }
    this.setData({
      tableNo:this.data.tableList[e.detail].text.substring(0,2),
      upNum:upNum
    })
  },
  changeTotalNum(e){
    this.setData({
      totalNum:e.detail
    })
  },
  changeTime(e){
    this.setData({
      showTimePicker: true
    })
  },
  cancelPicker(){
    this.setData({
      showTimePicker: false
    })
  },
  onConfirm(event){
    const { value} = event.detail;
    console.log(value.join(""))
    this.setData({
      showTimePicker:false,
      time:value.join(""),
    })
  },
  changePayment(e){
    this.setData({
      payment:e.detail
    })
  },
  changeTheme(e){
    this.setData({
      theme:e.detail
    })
  },
  changeGender(e){
    this.setData({
      gender:e.detail
    })
  },
  /**
   * 发起拼桌
   */
  applyConfirm:function(e){
    wx.showToast({
      title: '发起拼桌...',
      icon: 'loading',
      mask: true,
    })
    let that = this
    const {tableNo, totalNum, time, payment, theme, gender, type} = this.data
    const myInfo = app.globalData.myInfo
    if(!myInfo._id || myInfo._id == '') {
      wx.showToast({
        title: '发起失败',
        icon: 'error',
      })
      return
    }
    var timeStamp = Date.parse(new Date());
    timeStamp = timeStamp / 1000;
    var _id=tableNo+'_01_'+ this.getNowFormatDate()
    console.log(_id) 
    var userInfo = myInfo
    userInfo.state=0
    if(time=='' || theme=='' || tableNo==''){
      wx.showToast({
        title: `请填写必填项`, 
        icon: 'none',
      });
      return
    }
    const orderList=[{
      _id:_id,
      tableNo:tableNo,
      upNum: totalNum,
      time:time,
      payment:payment,
      theme:theme,
      gender:gender,
      state:1,
      create_time: timeStamp,
      members:[userInfo],
      addNum:1
    }]
    wx.cloud.callFunction({
      name : 'addOrderFun',
      data: {
        orderList:orderList
      },
      success(res){
        console.log("发起拼桌成功",res)
        wx.showToast({
          title: '发起成功',
          icon: 'success',
        })
        if(type=='book') that.sendRemoteMsg()
        that.sendMsg()
        that.creatConnect(orderList[0])
      },
      fail(err){
        console.log("发起拼桌失败",err)
        wx.hideToast()
        wx.showToast({
          title: '发起失败',
          icon: 'error',
        })
      }
    })
    
  },
  sendRemoteMsg(){
    //消息推送
    wx.requestSubscribeMessage({
      tmplIds: ['nkMJ7qtnv9xJN3oiLTWDibFbKNPC537dt_G75mND6q4'],
      success(res){
        console.log(res)
        wx.cloud.callFunction({
          name:'sendRemoteMsg',
          data:{
            time: time,
            userId: myInfo._id
          },
          success(res){
            console.log("推送消息成功", res)
        },
        fail(err){
          console.log("推送消息失败", err)
        }
      })
    },
    fail(err){
      console.log(err)
    }
  })
  },
  creatConnect(order){
    var timeStamp = Date.parse(new Date());  
    timeStamp = timeStamp / 1000;  
    const db = wx.cloud.database()
    const Connect = db.collection('chat_connect')
    Connect.add({
      data:{
        from_id: order._id,
        avatar: '',
        name: order.tableNo+"号桌的群聊",
        time: timeStamp,
        content: "你已加入"+ order.tableNo+"号桌的群聊",
        hasUnread: true,
        class:'group',
        state:'enable',
      },
      success:function(res){
        console.log("创建桌子群聊")
        wx.switchTab({
          url: '/pages/index/index',
        })
      },
      fail:function(err){
        console.log("创建桌子群聊失败",err)
      }
    })
  },
  sendMsg(){
    const {tableNo} = this.data
    const myInfo = app.globalData.myInfo
    var timeStamp = Date.parse(new Date());  
    timeStamp = timeStamp / 1000;  
    const msg = {
      _id: timeStamp,
      from_id:"system",
      from_name: "系统消息",
      from_avatar:"/images/message/msg_icon.png",
      to_id: myInfo._id,
      to_name: myInfo.nickname,
      content: "您已发起"+tableNo+"桌的拼桌",
      content_type: "text",
      class: "system",
      isread: false,
    }
    const db = wx.cloud.database()
    const Message = db.collection('chat_message')
    Message.add({
      data: msg,
    }).then(res =>{
      console.log("发送发起拼桌消息成功")
    })
  },
  handleWatch: async function (watch) {
    var tables=app.globalData.tableInfo
    var tableList=[{ text: '桌号', value: 0, icon:''}]
    let {queueWatch} = this.data
    const {startTime, endTime, restartTime} = this.getTime()
    const timeStamp = Date.parse(new Date())/1000
    const gtTime = timeStamp < endTime && timeStamp > startTime? startTime:endTime
    const ltTime = timeStamp < endTime && timeStamp > startTime? endTime:restartTime
    const db = wx.cloud.database()
    const _ = db.command
    const Order = db.collection('order_info')
    const that = this
    if (watch && !queueWatch) { // 监听
      queueWatch = Order.where({
        creat_time: _.and(_.gt(gtTime), _.lt(ltTime)),
        state: 1,
      }).orderBy('tableNo','asc').watch({
        // 发起监听
        onChange: function ({docs}) {
          console.log("拼桌列表发生变化,现有订单数:",docs.length)
          var cells=[]
          for(var i=0;i<docs.length;i++){
          var cell=new Object()
          cell['tableNo']=docs[i].tableNo
          cell['upNum']=docs[i].upNum
          cells.push(cell)
          }
          for (var i = 0; i < tables.length; i++) {
            for (var j = 0; j < cells.length; j++) {
              if (tables[i].tableNo== cells[j].tableNo) {
                tables.splice(i, 1);
                i=i-1;
              }
            }
          }
          for(var i=0;i<tables.length;i++){
            var list=new Object()
            list['text']=tables[i].tableNo+'('+tables[i].upNum.toString()+'人桌'+')'
            list['value']=i+1
            list['icon'] = ''
            tableList.push(list)
          }
          that.setData({
            tableList:tableList
          })
        },
        onError: function (err) {
          console.log('the watch closed because of error')
        }
      })
      this.setData({ queueWatch })
    } else if (!watch && queueWatch) { // 取消监听
      await queueWatch.close()
      this.setData({ queueWatch: '' })
    }
  },
   /**
  * Tool
  * startTime:开始预约时间当天2:00
  * endTime: 结束预约(开始现场)时间当天18:00
  * restartTime:结束现场(开始预约)时间第二天2:00
  */
  getTime(){
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth()
    var day = date.getDate()
    var hour = date.getHours()
    const startDate = new Date(year, month, day, 2, 0, 0)
    var startStamp = Date.parse(startDate) / 1000;
    const endDate = new Date(year, month, day, 18, 0, 0)
    var endStamp = Date.parse(endDate)  / 1000;
    if(hour>=0 && hour <2) {
      startStamp = startStamp - 24 * 60 * 60
      endStamp = endStamp - 24 * 60 * 60
    }
    return {
      startTime: startStamp,
      endTime: endStamp,
      restartTime: endStamp + 24 * 60 * 60,
    };
  },
  getNowFormatDate(){
    let date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const day = date.getDate()
    return year + '/' + month + '/' + day
  }
})