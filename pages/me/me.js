// pages/me/me.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
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
      accountInfo: app.globalData.accountInfoProvider,
    });    
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
    wx.previewImage({
      current: url,
      urls: [url]
    });
  }
})
