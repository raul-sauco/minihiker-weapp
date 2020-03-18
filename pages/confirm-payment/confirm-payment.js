// pages/confirm-payment/confirm-payment.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    accountInfo: null,
    programGroup: null,
    program: null,
    price: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    // Fetch the programGroup and program from the global programProvider
    const pg = app.globalData.programProvider.get(options.pg),
      program = pg.programs.find( p => p.id === +options.p ),
      price = program.prices.find( pr => pr.id === +options.price);

    this.setData({
      accountInfo: app.globalData.accountInfoProvider,
      programGroup: pg,
      program: program,
      price: price
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

  }
})
