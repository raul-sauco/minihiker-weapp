// pages/select-participants/select-participants.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    program: null,
    price: null,
    accountInfo: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    // Fetch the programGroup and program from the global programProvider
    let pg = app.globalData.programProvider.get(options.pg);
    let p = pg.programs.find(program => {
      return program.id == options.p;
    });
    let price = p.prices.find(price => price.id == options.price);

    this.setData({
      programGroup: pg,
      program: p,
      price: price,
      accountInfo: app.globalData.accountInfoProvider
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