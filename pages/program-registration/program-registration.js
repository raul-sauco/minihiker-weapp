// pages/program-registration/program-registration.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    program: null,
    accountInfo: null,
    selectedPrice: null,
    amountDue: 0,
    resUrl: app.globalData.resUrl,
    selectPriceWarningVisible: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '正在报名',
    });

    // Fetch the programGroup and program from the global programProvider
    let pg = app.globalData.programProvider.get(options.pg);
    let p = pg.programs.find(program => {
      return program.id == options.p;
    });

    p.prices = this.getPricesInCategory(p, app.globalData.accountInfoProvider.category);
    p.minPrice = this.getMinPrice(p.prices);
    p.maxPrice = this.getMaxPrice(p.prices);

    p.formattedStartDate = this.formatDate(p.start_date);
    p.formattedEndDate = this.formatDate(p.end_date);

    this.setData({
      programGroup: pg,
      program: p,
      accountInfo: app.globalData.accountInfoProvider
    });
  },

  /**
   * Eliminate the prices that don't belong to the user category 
   * from the prices that are displayed.
   */
  getPricesInCategory: function (program, cat) {

    let prices = [];

    program.prices.forEach(price => {

      if (cat === '会员' && price.membership_type == 1) {
        prices.push(price);
      } else if (cat === '非会员' && price.membership_type == 0) {
        prices.push(price);
      }

    });

    return prices;
  },

  /**
   * Get the minimum price out of a set of prices.
   */
  getMinPrice: function (prices) {
    
    let min = 0;

    prices.forEach(price => {
      if ((price.price && min === 0) || price.price < min) {
        min = price.price;
      } 
    });

    return min;
  },

  /**
   * Get the maximum price out of a set of prices.
   */
  getMaxPrice: function (prices) {

    let max = 0;

    prices.forEach(price => {
      if (price.price > max) {
        max = price.price;
      }
    });

    return max;
  },

  /**
   * Handle tap on one of the prices.
   */
  selectPrice: function (e) {

    let id = e.currentTarget.dataset.id;

    // Toggle selected price status if active
    if (this.data.selectedPrice && this.data.selectedPrice.id === id) {

      this.setData({
        selectedPrice: null,
        amountDue: 0
      });

    } else {

      let selectedPrice = this.data.program.prices.find(price => {
        return price.id === id;
      });

      this.setData({
        selectedPrice: selectedPrice,
        amountDue: selectedPrice.price
      });

    }
  },

  /** 
   * Handle click on process payment button
   * If the user has selected a price, it will call processPayment
   * otherwise, it will display a warning asking the user to select
   * a price
   */
  handlePaymentClick: function () {

    console.debug('Handling click on process payment button');

    // Handle a click on the payment button
    if (this.data.selectedPrice && this.data.amountDue) {

      // The user has selected a price, process the payment
      this.processPayment();

    } else {

      console.debug('User trying to pay without selecting price, displaying warning');

      // The user has not selected a price, show a warning
      this.setData({
        selectPriceWarningVisible: true
      });

      setTimeout(this.hideSelectPriceWarning, 3000);

    }

  },

  /** Hide the select price warning dialog */
  hideSelectPriceWarning: function () {

    console.debug('Hiding select price warning');

    this.setData({
      selectPriceWarningVisible: false
    });

  },

  /**
   * Process client payment for a given program.
   */
  processPayment: function () {

    const selectedPrice = this.data.selectedPrice,
      amount = this.data.amountDue,
      data = {
        price: selectedPrice.id,
        amount: amount
      },
      endpoint = 'wx-payment',
      header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      };

    wx.showLoading({
      title: '处理付款',
    });

    console.group('Requesting process payment from backend');

    // Send data to the minihiker server. The server expects two parameters
    // {
    //   amount: 1 // number: the total amount the user will be charged for
    //   price: 25 // number: the id of the Price model the user has selected 
    // }
    wx.request({
      url: app.globalData.url + endpoint,
      data: data,
      method: 'POST',
      header: header,
      success: res => {
        
        // Check if the request was successfull
        if (res.statusCode === 200 || res.statusCode === 201) {

          console.debug('Request successful, obtaining confirmation from end user');
          // Success creating the prepay order, show confirmation dialog
          this.requestPaymentConfirmation(res.data);

        } else {

          // Server error, either MH or Wx
          console.warn('Request success but status not 200 or 201');
          console.debug(res);

          wx.showToast({
            title: '服务器或网络错误, 请稍后再试。',
            icon: 'none'
          });

        }
      },
      fail: res => {

        console.warn('Request failed. ' + app.globalData.url + endpoint);
        console.debug(res);

        wx.showToast({
          title: '服务器或网络错误, 请稍后再试。',
          icon: 'none'
        });

      },
      complete: res => {

        console.debug('Request completed. ' + app.globalData.url + endpoint);
        console.groupEnd();

        wx.hideLoading();

      }
    });

  },

  /**
   * Request payment confirmation from the user.
   * 
   * The method will receive an object with the prepay order data
   * {
   *   appId: ***,
   *   timeStamp: ***,
   *   nonceStr: ***,
   *   package: 'prepay_id=NA898977AOEHUD***',
   *   signType: MD5,
   *   paySign: ***
   * }
   */
  requestPaymentConfirmation: function (order) {

    wx.requestPayment({
      'timeStamp': '' + order.timeStamp,
      'nonceStr': order.nonceStr,
      'package': order.package,
      'signType': order.signType,
      'paySign': order.paySign,
      'success': res => {

        // Display payment confirmation
        wx.navigateTo({
          url: '/pages/confirm-payment/confirm-payment?pg=' + this.data.programGroup.id +
            '&p=' + this.data.program.id + '&price=' + this.data.selectedPrice.id,
        });

      },
      'fail': res => {

        console.log(res);
        wx.showModal(
          '付款失败'
        );

      }
    });

  },

  /**
   * Generate a random string of a required length
   */
  generateRandomString: function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for( var i = 0; i<length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  /**
   * Return a formatted version of the date.
   */
  formatDate: function (dateString) {
    const currentYear = new Date().getFullYear();

    let dates = dateString.split("-");
    let formattedDate = '';

    if (currentYear !== parseInt(dates[0])) {

      formattedDate += dates[0] + '年';

    }

    formattedDate += dates[1] + '月';
    formattedDate += dates[2] + '日';

    return formattedDate;

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