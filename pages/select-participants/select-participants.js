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

    console.debug('Select participants for ProgramGroup ' + options.pg + ' program ' + options.p + ' price ' + options.price);

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

  }
  
})