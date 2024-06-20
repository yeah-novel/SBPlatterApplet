// components/SBTableCell/sbTableCell.js
var app = getApp() //获取app的全局变量
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderIndex:{ 
      type:Number, 
      value:0 
    },
    allOrderList:{ 
      type:Object
    },
    cellData:{ 
      type:Object,
      value:{},
      observer:function(newData){
        this.setData({
          isIn: false
        })
        for(var index in newData.members){
          if(newData.members[index]._id == app.globalData.myInfo._id){
            this.setData({
              isIn: true
            })
            return
          }
        }
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    isIn:false, //是否已在该拼桌
  },
  lifetimes:{
    attached:function(){
      const {cellData} = this.properties
      if(cellData.members && cellData.members>0){
        for(var index in this.data.cellData.members){
          if(this.data.cellDatamembers[index]._id == app.globalData.myInfo._id){
            this.setData({
              isIn: true
            })
            return
          }
        }
      }
     
    },
    detached:function(){
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toDetailPage:function(){
      const {cellData, isIn, allOrderList} = this.data
      var creatidList=[]
      for(var i=0;i<allOrderList.length;i++){
        for(var j=0;j<allOrderList[i].members.length;j++)
        creatidList.push(allOrderList[i].members[j]._id)
      }
      if(!isIn && creatidList.indexOf(app.globalData.myInfo._id)>-1){
        wx.showModal({
          title: '提示',
          content: '您已发起拼桌，不可加入拼桌',
        })
      }else{
        wx.navigateTo({
          url: '/pages/index/tableDetail/tableDetail?tableInfo='+ JSON.stringify(cellData)
        });
      }
    }
  }
})
