// pages/my-program-details/my-program-details.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    program: null,
    resUrl: app.globalData.resUrl,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.showLoading({
      title: '下载中',
    });

    // We need to find the program group Id based on the program id
    // This could require an asyncronous call if we don't have it already
    app.globalData.programProvider.getProgramGroupIdByProgramId(options.id).then(res => {

      console.log(res);

      // res is a ProgramGroup
      this.setData({
        programGroup: res,
        program: res.programs.find( p => p.id === options.id )
      });

      wx.hideLoading();

      wx.setNavigationBarTitle({
        title: this.data.programGroup.weapp_display_name
      });

      console.log(this.data.program.id);
      console.log(this.data.programGroup.weapp_display_name);

    }, err => {

      console.warn(err);
      wx.hideLoading();
      
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