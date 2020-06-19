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
    staticUrl: app.globalData.staticUrl,
    accountInfo: null,
    qrCodeVisible: false
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
  },

  /**
   * Bind to the official-account load event
   */
  officialAccountLoad: function (e) {
    console.debug('Loaded official-account button', e.detail);
    this.setData({
      qrCodeVisible: false
    });
  },

  /**
   * Bind to the official-account error event
   */
  officialAccountError: function (e) {
    console.log('Error loading official-account button', e);
    this.setData({
      qrCodeVisible: true
    });
  },

  /**
   * Display the current image in full screen mode
   */
  showImage: function (e) {
    const url = e.currentTarget.dataset.url;
    console.log(url);
    wx.previewImage({
      current: url,
      urls: [url]
    });
  }
})
