// pages/program/program.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    programProvider: app.globalData.programProvider,
    program: null,
    images: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      program: options.id
    });

    wx.setNavigationBarTitle({
      // title: this.data.programGroup.weapp_display_name
      title: 'Just testing...'
    });

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})