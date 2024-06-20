// components/SBSwiper/SBSwiper.js
Component({

  options:{
    styleIsolation:'isolated'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // images : Array
    images :{
      type: Array,
      value: [
        "/images/index/bar_image.png",
        "/images/index/ad_image.png"
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0 , // 初始高亮下标

    indexImages: [
      "/images/index/bar_image.png",
      "/images/index/adSecond.jpg"
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /* 图片轮播指示点高亮 */
    swiperChange(e) {     
      this.setData({
        currentIndex: e.detail.current
      })      
    }
    
  }
})
