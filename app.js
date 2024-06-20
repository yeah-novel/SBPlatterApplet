// app.js
App({
  globalData:{
    screenHeight:0,
    open_id:"",
    hasUserInfo:false,
    myInfo:{},
    tableInfo:{},
  },
  
  onLaunch:function(){
    this.initCloud()
    this.getSys()
    this.getTableInfo()
    this.userLogin()
  },

  onShow:function(){
    this.getUnreadMsgNum()
  },
  onHide:function(){
  },
    /**
   * cloud init
   */
  initCloud:function(){
    wx.cloud.init({
      env: 'sb-pa-0gqhiw74d5c2e5ba',
      traceUser: true,
    })
  },
  /**
   * 判断用户是否首次登录
   */
  userLogin:function(){
    let that = this
    wx.cloud.callFunction({
      name : 'getUserFun',
      data : {},
      success:function (res) {
        console.log(res.result)
        that.globalData.open_id = res.result.openId
        
        if(res.result.userInfo.data.length == 0){
          console.log("用户未注册，前往登录页", that.globalData.open_id)
        }else{
          console.log("用户已注册，前往首页")
          const userInfo = res.result.userInfo.data[0]
          console.log("用户信息:", userInfo)
          that.globalData.hasUserInfo = true
          that.globalData.myInfo = userInfo
          that.globalData.open_id = userInfo._id
        }
        if(that.loginCallback){
          that.loginCallback({
            openId:res.result.openId, 
            flag:that.globalData.hasUserInfo
          });
        }
      },
      fail:function (err) {
        wx.showToast({
          title: '用户数据获取失败，请重试',
          icon:'error'
        })
      }
    })
  },

  //得到桌位信息
  getTableInfo:function(){
    //得到桌位信息 
    let that = this
    var cells=[]
    wx.cloud.callFunction({
      name : 'getTableFun',
      success:function (res) {
        var data=res.result.tableInfo.data 
        for(var i=0;i<data.length;i++){ 
          var cell=new Object() 
          cell['tableNo']=data[i].tableNo 
          cell['upNum']=data[i].upNum 
          cell['Store']=data[i].Store
          cells.push(cell) 
        } 
        that.globalData.tableInfo=cells
      },
      fail:function (err) {
        wx.showToast({
          title: '获取作为信息失败',
        })
      }
    })
  },

  getSys:function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        let clientWidth = res.windowWidth;
        let clientHeight = res.windowHeight;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        that.globalData.windowW=res.windowWidth;
        that.globalData.screenHeight = height;
      }
    })
  },
  getUnreadMsgNum:function(){
    wx.cloud.callFunction({
      name:'getUnreadMsgFun',
      data:{},
      success:function(res){
        const num = res.result.data.length
        console.log("有未读消息：",num)
        if(num>0){
          wx.showTabBarRedDot({
            index: 2,
          })
        }else{
          wx.hideTabBarRedDot({
            index: 2,
          })
        }
      },
    })
  },
})
