// pages/myInfo/myInfo.js
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    myInfo:{},
    nowTime:0,
    changName:"",
    changeNameDialog :false,
    contactUsDialog: false,
  },
  /**
   * 全局有用户信息调用全局数据
   * 没有则获取数据库信息
   */
  onLoad(options) {
  },
  onShow(){
    this.setData({
      myInfo: app.globalData.myInfo
    })
  },
  /**
   * 修改并上传头像
   */
  changeAvatar(){
    let that = this
    wx.chooseMedia({
      count : 1,
      mediaType : ['image', 'video'],
      sourceType : ['album', 'camera'],
      maxDuration : 30,
      camera : 'back',
      success : res => {
        that.upAvatar(res.tempFiles[0].tempFilePath)
      }
    })
  },
  upAvatar(filePath){
    let that = this
    const {myInfo} = this.data
    var timeStamp = Date.parse(new Date()); 
    timeStamp = timeStamp / 1000;
    wx.cloud.uploadFile({
      cloudPath : "avatar/" + myInfo._id +timeStamp +".jpg",
      filePath: filePath,
      success:function(res){
        console.log("头像上传成功")
        that.updateAvatarData(myInfo, res.fileID)
      },
      fail:function(err){
        console.log("头像上传失败")
        wx.showToast({
          title: '头像上传失败',
          icon: 'error',
        })
      }
    })
  },
  /**
   * 修改数据库用户头像
   */
  updateAvatarData(myInfo, filePath){
    let that = this
    var info = myInfo
    info.avatar = filePath
    wx.cloud.callFunction({
      name:'updateAvatarFun',
      data:{
        avatar: filePath
      },
      success:function (res) {
        console.log("更新头像成功", res)
        wx.showToast({
          title: '头像修改成功',
          icon: 'success',
        })
        app.globalData.myInfo = info
        that.setData({
          myInfo: info
        })
      },
      fail:function (err) {
        console.log("更新头像失败", err)
        wx.showToast({
          title: '头像修改失败',
          icon: 'error',
        })
      }
    })
  },
  /**
   * 修改昵称
   */
  showDialog(){
    console.log("showDialog")
    this.setData({
      changeNameDialog: true
    })
  },
  inputNickname(e){
    this.setData({
      changName: e.detail.value
    })
  },
  updateNickname(){
    console.log("updateNicknam")
    const {changName, myInfo} = this.data
    let that = this
    wx.cloud.callFunction({
      name : 'updateNicknameFun',
      data:{
        nickname: changName
      },
      success(res){
        var info = myInfo
        info.nickname = changName
        console.log("昵称修改成功",res.result)
        app.globalData.myInfo = info
        that.setData({
          myInfo: info
        })
        wx.showToast({
          title: `昵称修改成功`, 
          icon: 'none',
        });
      },
      fail(err){
        console.log("昵称修改失败",err)
        wx.showToast({
          title: `昵称修改失败`, 
          icon: 'none',
        });
      }
    })
  },
  /**
   * 联系我们
   */
  contactUs(){
    console.log("contactUs")
    this.setData({
      contactUsDialog: true
    })
  } ,
  /**
   * 隐私政策
   */
  navigateToPrivate(){
    wx.navigateTo({
      url: '/pages/myInfo/privatePolicy/privatePolicy',
    })
  },
  onClose(){
    this.setData({
      contactUsDialog:false,
      changeNameDialog: false
    })
  },
   /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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