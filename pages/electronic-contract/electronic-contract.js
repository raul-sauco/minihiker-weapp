// pages/electronic-contract/electronic-contract.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    authHidden:true, //认证页面是否完成
    finished:0, //已完成
    unfinished:0, //未完成
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     var that = this;

    
    //  console.log(app.globalData.userInfo)
  
  },

// 判断是否已经完成认证
authentication:function(){
  var that = this;
  var userid = wx.getStorageSync('userId')
  const endpoints = 'authentics/'+userid+'?fields=is_verify'
  wx.request({
    url: app.globalData.url+endpoints,
    method: 'get',
    header:{
     'Content-Type': 'application/json',
     'Authorization': 'Bearer ' + app.globalData.accessToken
    },
    success(res){
       console.log(res)
      //  authHidden
      if(res.statusCode == 200){
        if(res.data.is_verify==0){
          that.setData({
            authHidden:false
          })
        }else if(res.data.is_verify==1){
          that.setData({
            authHidden:true
          })
        }
      }

    },
    fail(res){
      console.log(res)
    }
  })
},

// 签名和已签约合同的数目接口
autographList:function(){
  var that = this
   var endpointa = 'contracts/scount'
   wx.request({
     url: app.globalData.url + endpointa,
     method:'GET',
     header:{
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
     },
     success(res){
      //  console.log('000')
      //  console.log(res)
       if(res.statusCode == 200){
           that.setData({
            finished:res.data.finished,
            unfinished:res.data.unfinished
           })
       }
     },
     fail(res){
       console.log(res)
     }
   })
},



  
  // 点击前往认证页面
  btn_authentication:function(){
   wx.navigateTo({
     url: '/pages/authentication/authentication',
   })
  },


  // 前往需要签名页面
  btn_list:function(){
    wx.navigateTo({
      url: '/pages/contract-list/contract-list',
    })
  },

  // 前往已签约合同页面
  btn_completed:function(){
    wx.navigateTo({
      url: '/pages/completed-contract/completed-contract',
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
   var that = this
   that.authentication();  //判断是否已经认证
   that.autographList(); //签名和已经签约合同的数目
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