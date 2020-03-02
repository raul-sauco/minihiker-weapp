// pages/my-payments/my-payments.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    payments: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '我的订单'
    });

    this.fetchPayments();

  },

  /**
   * Fetch the current account's payments.
   */
  fetchPayments: function () {

    wx.showLoading({
      title: '下载中',
    });

    // Fetch most recent payments first with 
    const url = app.globalData.url + 'wx-unified-payment-orders?expand=price.program.programGroup,price.program.participants&sort=-created_at',
      header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      }

    wx.request({
      url: url,
      method: 'GET',
      header:header,
      success: res => {

        console.log('TODO implement pagination');  // TODO implement pagination based on headers

        res.data.forEach(payment => {
          payment.created_at_fmt = util.formatTime(new Date(payment.created_at * 1000));
          payment.status_text = this.getStatusText(payment.status);
          payment.total_fee = parseInt(payment.total_fee);
          payment.status_icon = this.getStatusIconCss(payment.status);
        });

        this.setData({
          payments: res.data
        });

        // Store them in the app instance
        app.globalData.payments = res.data;

      },
      fail: res => {
        console.warn("Request failed: " + url);
      },
      complete: res => {
        console.debug("Request completed: " + url);
        wx.hideLoading();
      }
    });

  },
  
  /**
   * Handle click in one of the payments. 
   * It will redirect to the payment page.
   */
  viewPayment: function (event) {
    wx.navigateTo({
      url: '/pages/payment/payment?id=' + event.currentTarget.dataset.paymentId,
    });
  },

  /**
   * Get the textual meaning of the status.
   */
  getStatusText: function (status) {
    let texts = [
      '发起',
      '服务器错误',
      '正在等待用户确认',
      '确认错误',
      '付款已确认'
    ];

    return texts[status];
  },

  /**
   * Get the icon that corresponds the status.
   */
  getStatusIconCss: function (status) {
    let texts = [
      'fas fa-info-circle text-info',
      'fas fa-exclamation-triangle text-warning',
      'far fa-clock text-primary',
      'fas fa-ban text-danger',
      'fas fa-check text-success'
    ];

    return texts[status];
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    this.fetchPayments();
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    console.log('// TODO fetch more items.');
  }
})
