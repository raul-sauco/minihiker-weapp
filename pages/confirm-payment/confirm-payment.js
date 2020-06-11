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
  onLoad: function(options) {
    wx.showNavigationBarLoading();
    // Try fetching the programGroup and program from the programProvider
    const programGroup = app.globalData.programProvider.get(options.pg);
    let program;
    if (programGroup) {
      program = programGroup.programs.find(p => p.id === +options.p);
    }
    if (program) {
      const price = program.prices.find(pr => pr.id === +options.price);
      this.setProperties(programGroup, program, price);
    } else {
      app.globalData.programProvider.fetchProgramGroup(options.pg).then(
        pg => {
          const p = pg.programs.find(p => p.id === +options.p);
          const pr = p.prices.find(pr => pr.id === +options.price);
          this.setProperties(pg, p, pr);
        }).catch(err => {
        console.error(err);
        wx.hideNavigationBarLoading();
        wx.showToast({
          title: '下载错误',
          icon: 'none',
          duration: 4000
        });
      });
    }
  },

  /**
   * Set the page properties once we have the program info
   */
  setProperties: function(pg, program, price) {
    wx.hideNavigationBarLoading();
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
  selectParticipants: function() {

    wx.navigateTo({
      url: "/pages/select-participants/select-participants?pg=" + this.data.programGroup.id +
        "&p=" + this.data.program.id + "&price=" + this.data.price.id
    });

  }
})