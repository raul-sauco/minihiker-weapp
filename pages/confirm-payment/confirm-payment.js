// pages/confirm-payment/confirm-payment.js
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
   * Navigate to the select participant page.
   */
  selectParticipants: function () {

    wx.navigateTo({
      url: "/pages/select-participants/select-participants?pg=" + this.data.programGroup.id + 
        "&p=" + this.data.program.id + "&price=" + this.data.price.id
    });

  },

  /**
   * Navigate to the International programs page.
   */
  navigateInt: function () {

    wx.switchTab({
      url: '/pages/index/index',
    });

  },

  /**
   * Navigate to the National programs page.
   */
  navigateNat: function () {

    wx.switchTab({
      url: '/pages/national/national',
    });

  }

})