// pages/my-payments/my-payments.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    payments: null,
    filter: 0
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
          payment.filter = this.getStatusFilter(payment.status);
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
   * Handle click on the delete payment button.
   */
  deletePayment: function (event) {
    const payment = this.data.payments.find(
      p => p.id === event.currentTarget.dataset.paymentId
    );
    wx.showModal({
      title: '是否确认删除项目？',
      content: '客户端的删除不会影响已经缴费的报名信息',
      success: res => {
        if (res.confirm) {
          this.sendDelete(payment.id);
        } else if (res.cancel) {
          console.debug(`Payment ${payment.id} delete cancelled by user`);
        }
      }
    });
  },

  /**
   * Send a DELETE request for a given payment, identified by 
   * it's ID, and handle the response
   */
  sendDelete: function (id) {
    wx.showLoading({
      title: '更新中',
    });
    wx.request({
      url: app.globalData.url + 'wx-unified-payment-orders/' + id,
      method: 'PUT',
      data: { 'hidden': 1 },
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {
        if (res.statusCode === 200) {
          // TODO consider hiding the payment instead of reloading
          this.fetchPayments();
        } else if (res.statusCode === 422) {
          console.error('Validation errors');
          wx.showToast({
            title: '服务器错误，请稍后再试',
          });
        } else {
          wx.showToast({
            title: '服务器错误，请稍后再试',
          });
          console.warn('Unrecognized response code ' + res.statusCode);
        }
      },
      fail: res => {
        wx.showToast({
          title: '服务器错误，请稍后再试',
        });
        console.error(res);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  /**
   * Handle click in the select participants button for one of the 
   * payments.
   */
  editParticipants: function (event) {

    const payment = this.data.payments.find(p => p.id === event.currentTarget.dataset.paymentId);

    wx.navigateTo({
      url: "/pages/select-participants/select-participants?pg=" + payment.price.program.program_group_id +
        "&p=" + payment.price.program_id + "&price=" + payment.price.id
    });

  },

  /**
   * Update the current filtering criteria
   */
  switchFilter: function (event) {

    this.setData({
      filter: +event.currentTarget.dataset.filter
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
   * Get the value of the filter to apply
   */
  getStatusFilter: function (status) {
    if (status === 4) {
      return 1;
    } else {
      return 2;
    }
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
