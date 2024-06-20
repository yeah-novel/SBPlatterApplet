// pages/menu/menu.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeKey: 0,
    menuType:[], //菜单目录
    menuList:[], //所有菜单列表
    showLoad:true, //加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMenu()
  },
  getMenu(){
    let that = this
    wx.cloud.callFunction({
      name:'getMenuFun',
      data:{},
      success:function({result}){
        console.log("获取菜单成功:",result.data.length)
        that.setData({
          menuList: result.data,
          showLoad: false
        })
      },
      fail:function(res){
        console.log("获取菜单失败")
      }
    })
  },
  changeType(event){

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
  changeType(){

  },
})