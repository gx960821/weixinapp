// pages/index/index.js
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log("1")
  },
  onReady:function(){
    // 页面渲染完成
    console.log("2")
  },
  onShow:function(){
    // 页面显示
    console.log("3")
  },
  onHide:function(){
    // 页面隐藏
    console.log("4")
  },
  onUnload:function(){
    // 页面关闭
    console.log("5")
  }
})