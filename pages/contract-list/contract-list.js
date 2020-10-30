// pages/contract-list/contract-list.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     htItem:[], //合同列表数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getData();
  },

  getData:function(){
    var that = this;
    var endopit = 'contracts/list'
    wx.request({
      url: app.globalData.url + endopit,
      method:'GET',
      header:{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
       },
      data:{
        user_status:0
      },
      success(res){
        // console.log(res)
        if(res.statusCode==200){
          that.setData({
            htItem:res.data
          })
        }
        // console.log(that.data.htItem)
      },
      fail(res){
        console.log(res)
      }
    })
  },

  

  // 点击合同跳转页面
  btn_web:function(e){
    var that = this;
    // console.log(e.currentTarget.dataset.id)
    var hid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/webView/webView?id='+hid
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