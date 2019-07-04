// pages/payment/payment.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    payment: null,
    attributes: [
      ['total_fee', '金额'],
      ['status_text', '状态'],
      ['attach', '附加数据'],
      ['body', '商品描述'],
      ['detail', '商品详情'],
      ['created_at_fmt', '日期']
    ],
    loadingPg: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    // Get the payment
    let payment = app.globalData.payments.find(item => {
      return item.id == options.id;
    });

    this.setData({
      payment: payment
    });

    wx.setNavigationBarTitle({
      title: '我的付款' + payment.id
    });

  },

  /**
   * Navigate to the select participants page.
   */
  selectParticipants: function () {

    // Display loading status
    this.setData({
      loadingPg: true
    });

    // We need to find the program group Id based on the program id
    // This could require an asyncronous call if we don't have it already
    app.globalData.programProvider.getProgramGroupIdByProgramId(this.data.payment.price.program_id).then(res => {

      this.setData({loadingPg: false});

      wx.navigateTo({
        url: "/pages/select-participants/select-participants?pg=" + res.id +
          "&p=" + this.data.payment.price.program_id + "&price=" + this.data.payment.price.id
      });

    }, err => {
      console.warn(err);
      this.setData({ loadingPg: false });
    });

  }
})