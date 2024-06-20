// components/messageCell/messageCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message:{
      type:Object,
      value:{}
    },
    curIndex:{
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    click :true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    deleteMsg(event) { 
      let item = {index:this.data.curIndex}
      const { position, instance } = event.detail;  
      switch (position) {  
        case 'left':  
        case 'cell':  
          instance.close();
          break;  
        case 'right':  
          this.triggerEvent('deleteMsg', item);
          instance.close();
          break;  
      }  
    }, 
    toChatroom(event){
      let item = {index:this.data.curIndex}
      if(this.data.click){
        this.triggerEvent('toChatroom', item)
      }else{
        this.data({
          click:true
        })
      }

    }
  }
})
