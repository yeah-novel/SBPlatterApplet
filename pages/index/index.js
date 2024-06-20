// index.js
var app = getApp() //获取app的全局变量
var util = require('../../util/util')

Page({

  data: {
    scrollHeight:300,
    viewHeight:0,
    queueWatch: '',// 消息监听
    tableInfo: [],
    tables:[{ text: '桌号(人数)', value: '00', icon:'' }],
    cellData:[],
    option3: [
      { text: '拼桌意向', value: 'all', icon:''},
      { text: '男女不限', value: '男女不限', icon:'' },
      { text: '仅限女生', value: '仅限女生', icon:'' },
      { text: '仅限男生', value: '仅限男生', icon:'' },
    ],
    tableNo: '00',
    gender: 'all',
    tabTitle: 'live', //区分预约拼桌还是现场拼桌
    allOrderList:[],  //所有列表
    showLoad: true, //加载
    triggered:false, //下拉刷新是否被触发
  },
  watch:{
    'tableNo': function(value){
      console.log("监听tableNo", value)
      this.filterData()
    },
    'gender': function(value){
      console.log("监听gender", value)
      this.filterData()
    },
    'allOrderList':function(value){
      console.log("监听allOrderList", value)
      this.filterData()
    }
  },
  filterData(){
    const {tableNo, gender, allOrderList} = this.data
    var showOrderList = allOrderList
    if(tableNo=='00' && gender != 'all'){
      showOrderList = allOrderList.filter(item => item.gender == gender)
    }else if(tableNo!='00' && gender == 'all'){
      showOrderList = allOrderList.filter(item => item.tableNo == tableNo )
    }else if(tableNo!='00'&& gender != 'all'){
      showOrderList = allOrderList.filter(item => item.tableNo == tableNo && item.gender == gender)
    }
    console.log(showOrderList)
    this.setData({
       cellData: showOrderList
    })
  },
  onLoad(){  
    util.initWatch(this)
    var screenHeight = app.globalData.screenHeight
    this.setData({
      viewHeight : screenHeight,
      scrollHeight : screenHeight-250-120-80-10
    });
    this.handelinitData()
  },
  onShow(){
    this.handleWatch(true)
  },
  changeTab(event){
    console.log(event.detail.name)
    this.setData({
      tabTitle: event.detail.name
    })
  },
  reloadData(){
    console.log("index  下拉刷新")
    this.handelinitData()
  },
  /**
   * 拼桌列表初始化
   */
  handelinitData(){
    let that = this
    const {startTime, endTime, restartTime} = this.getTime()
    const timeStamp = Date.parse(new Date())/1000
    const gtTime = timeStamp < endTime && timeStamp > startTime? startTime:endTime
    const ltTime = timeStamp < endTime && timeStamp > startTime? endTime:restartTime
    console.log(gtTime, ltTime)
    wx.cloud.callFunction({
      name:'getOrderListFun',
      data:{
        gtTime: gtTime,
        ltTime: ltTime,
      },
      success:function({result}){
        console.log("获取拼桌列表:",result.data.length)
        that.setData({
          cellData:result.data,
          allOrderList: result.data,
          showLoad: false,
          triggered:false,
        })
        that.getTableInfo(result.data)
      },
      fail:function(err){
        console.log("获取拼桌列表失败")
        that.setData({
          showLoad: false,
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
      }
    })
  },
  getTableInfo(orderList){
    var tables = [{text:"桌号(人数)", value:'00', icon:''}]
    for (var index in orderList){
      const table = {
        text: orderList[index].tableNo+"桌("+orderList[index].upNum+"人)",
        value: orderList[index].tableNo,
        icon: '',
      }
      tables.push(table)
    }
    this.setData({
      tables: tables
    })
  },
  /**
   * 筛选符合条件的拼桌 
   */
  filterTabelNo(event){
    console.log(event.detail)
    this.setData({
      tableNo: event.detail
    })
  },
  filterGender(event){
    console.log(event.detail)
    this.setData({
      gender: event.detail
    })
  },
  /**
   * 前往发起 applyTable Page
   */
  applyTopz:function(){
    var {allOrderList} =this.data
    var creatidList=[]
    for(var i=0;i<allOrderList.length;i++){
      for(var j=0;j<allOrderList[i].members.length;j++)
      creatidList.push(allOrderList[i].members[j]._id)
    }
    if(creatidList.indexOf(app.globalData.myInfo._id)>-1){
      wx.showModal({
        title: '提示',
        content: '您已发起拼桌，不可重复参与',
      })
    }else{
      wx.navigateTo({
        url: '/pages/index/applyTable/applyTable?type='+ this.data.tabTitle,
      })
    }
  },
  /**
   * 监听数据列表
   */
  handleWatch: async function (watch) {
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
        create_time: _.and(_.gt(gtTime), _.lt(ltTime)),
      }).orderBy('tableNo','asc').watch({
        // 发起监听
        onChange: function ({docs}) {
          console.log("拼桌列表发生变化,现有订单数:",docs)
          that.getTableInfo(docs)
          that.setData({
            cellData: docs,
            allOrderList: docs
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
  }
});

