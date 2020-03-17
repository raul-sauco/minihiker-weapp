// pages/me/me.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    hasUserInfo: false,
    userInfo: null,
    resUrl: app.globalData.resUrl,
    accountInfo: null,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo,
      accountInfo: app.globalData.accountInfoProvider,
    });
    
  },

  /**
   * Lifecycle function--Called when page is shown
   */
  onShow: function () {
    // Force having user info
    if (!app.globalData.hasUserInfo) {

      console.debug('No user info found, redirecting to index page');
      wx.switchTab({
        url: '/pages/index/index',
      });

    }

    if (!this.data.hasUserInfo) {

      // If the user authorizes access after first load we won't have userInfo
      this.setData({
        hasUserInfo: app.globalData.hasUserInfo,
        userInfo: app.globalData.userInfo
      });
      
    }
  }
})
