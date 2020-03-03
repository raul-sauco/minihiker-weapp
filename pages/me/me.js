// pages/me/me.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
    userInfo: null,
    resUrl: app.globalData.resUrl
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });

    wx.setNavigationBarTitle({
      title: '我的'
    });
    
  }
})
