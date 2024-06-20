// pages/login/login.js
const app = getApp();
const timePicker = {
  月: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
  日: ['01日', '02日', '03日', '04日', '05日', '06日', '07日', '08日', '09日', '10日', '11日', '12日', '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日', '31日'],
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar:"/images/avatarDefault.png",
    tmp_avatar:"",
    nickname:"微醺的酒",
    gender:"fmale",
    time:'选择生日',
    showLoad: true,
    openId:'',
    showTimePicker: false, //日期选择器
    timeCell:[{
      values: timePicker['月'],
      className: 'column1',
      defaultIndex: 1,
    },
    {
      values: timePicker['日'],
      className: 'column2',
      defaultIndex: 1,
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(app.globalData.open_id && app.globalData.open_id!=''){
      this.setData({
        openId:app.globalData.open_id,
        showLoad: false,
      })
    }else{
      app.loginCallback = userInfo =>{
        console.log("app.loginCallback ", userInfo)
        if(userInfo.flag){
          wx.switchTab({
            url: '/pages/index/index',
          })
        }else if(userInfo.openId && userInfo.openId != ''){
          this.setData({
            showLoad:false,
            openId:userInfo.openId,
          })
        }else{
          wx.showToast({
            title: '请退出重试',
            icon:'error',
            mask: true,
          })
        }
      }
    }
  },
  /**
   * 
   * 上传头像到云服务的/avatar文件夹
   */
  onChooseAvatar(e){
    let that = this
    wx.chooseMedia({
      count : 1,
      mediaType : ['image', 'video'],
      sourceType : ['album', 'camera'],
      maxDuration : 30,
      camera : 'back',
      success : res => {
        that.setData({
          tmp_avatar : res.tempFiles[0].tempFilePath
        })
        that.upAvatar()
      }
    })
  },
  upAvatar(){
    console.log("login: upAvatar")
    var that = this
    const {openId} = this.data
    if(openId=='' || !openId) return
    console.log("openId:",openId) 
    wx.cloud.uploadFile({
      cloudPath : "avatar/" + openId +".jpg",
      filePath: that.data.tmp_avatar,
    })
    .then(res =>{
      console.log("上传头像成功",res.fileID)
      that.setData({
        avatar: res.fileID
      })
    })
  },
  addNickname(e){
    this.setData({
      nickname: e.detail.value
    })
  },
  changeGender(e){
    var gender = e.currentTarget.dataset.name
    this.setData({
      gender: gender
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
  signUp(){
    var s="魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯";
    const {time, gender, nickname, avatar, openId} = this.data
    const  birthMonth = time.substr(0,2)
    const  birthDay = time.substr(3,2)
    if(!time || time=='选择生日'){
      wx.showToast({
        title: `请填写生日`, 
        icon: 'none',
      });
      return
    }
    if(!this.data.openId || this.data.openId==''){
      wx.showToast({
        title: `注册失败，请检查网络`, 
        icon: 'none',
      });
      return
    }
    var constellation = s.substr(birthMonth*2-(birthDay<"102223444433".charAt(birthMonth-1)- -19)*2,2) + '座'
    console.log(avatar, nickname, gender, constellation)
    const userInfo = {
      _id : openId,
      nickname: nickname,
      avatar: avatar=='/images/avatarDefault.png'? '/images/avator.png': avatar,
      gender: gender,
      constellation: constellation
    }
    wx.cloud.callFunction({
      name : 'addUserFun',
      data:{
        nickname: nickname,
        avatar: avatar=='/images/avatarDefault.png'? '/images/avator.png': avatar,
        gender: gender,
        constellation: constellation
      },
      success(res){
        console.log("注册成功",res) 
        app.globalData.myInfo = userInfo
        wx.switchTab({
          url: '/pages/index/index'
        })
      },
      fail(err){
        console.log("注册失败",err)
        wx.showToast({
          title: `注册失败，请检查网络`, 
          icon: 'none',
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
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