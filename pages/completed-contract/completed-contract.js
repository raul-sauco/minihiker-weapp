// pages/completed-contract/completed-contract.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    finished:[], //已经签约的合同列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getData();
  },

  getData:function(){
    var that = this
    var endopit = 'contracts/list'
    wx.request({
      url: app.globalData.url + endopit,
      method:'GET',
      header:{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
       },
      data:{
        user_status:1
      },
      success(res){
        // console.log(res)
        if(res.statusCode==200){
          that.setData({
            finished:res.data
          })
        }
      },
      fail(res){
        console.log(res)
      }
    })
  },

  btn_web:function(e){
    wx.navigateTo({
      url: '/pages/webView/webView?id='+e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})