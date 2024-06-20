// components/orderCell/orderCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order:{
      type:Object,
      value:{}
    },
    userInfo:{
      type:Object,
      value:{}
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: { 
    hasArrived:false,//是否到店
  },

  lifetimes:{
    attached:function(){
      const {order, userInfo} = this.properties
      for(var index in order.members){
        if(order.members[index]._id==userInfo._id){
          if(order.members[index].state == 1){
            this.setData({
              hasArrived:true
            })
          }
          return
        }
      }
    },
  },
  /**
   * 组件的方法列表
   */

  methods: {
    toDetailPage(){
      const {order} = this.properties
      wx.navigateTo({
        url: '/pages/index/tableDetail/tableDetail?tableInfo='+ JSON.stringify(order)
      });
    },
    leaveFromTable(event){
      console.log("leaveFromTable")
      let item = {order:this.properties.order}
      this.triggerEvent('leaveFromTable', item)
    },
    hasArrived(event){
      let that = this
      console.log("hasArrived")
      const {order, userInfo} = this.properties
      for(var index in order.members){
        if(order.members[index]._id==userInfo._id){
          order.members[index].state = 1
        }
      }
      wx.cloud.callFunction({
        name:'updateOrderUserFun',
        data:{
          orderId: order._id,
          members: order.members,
        },
        success:function(res){
          console.log("更新状态成功:", res.result)
          that.setData({
            hasArrived: true
          })
        },
        fail:function(err){
          console.log("更新状态失败:", err)
        }
      })
    }
  }
})
