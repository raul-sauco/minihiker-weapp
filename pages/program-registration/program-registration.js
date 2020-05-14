// pages/program-registration/program-registration.js
const app = getApp();
const utils = require('../../utils/util.js');

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
    deposit: 0,
    resUrl: app.globalData.resUrl,
    selectPriceWarningVisible: false,
    contactInfoModalVisible: false
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

    p.prices = this.getPricesInCategory(p, app.globalData.accountInfoProvider.category);
    p.minPrice = this.getMinPrice(p.prices);
    p.maxPrice = this.getMaxPrice(p.prices);

    p.formattedStartDate = utils.formatDate(p.start_date);
    p.formattedEndDate = utils.formatDate(p.end_date);

    this.setData({
      programGroup: pg,
      program: p,
      accountInfo: app.globalData.accountInfoProvider
    });
  },

  /** 
   * Use onShow to refresh account info, useful to get the latest
   * version on page load, and to refresh the data after an 
   * user edit.
   */
  onShow: function () {
    this.refreshAccountInfo();
  },

  /**
   * Ask the account info provider to update account info from
   * the server.
   */
  refreshAccountInfo: function () {

    wx.showNavigationBarLoading();

    // Refresh account info
    app.globalData.accountInfoProvider.fetchAccountInfo().then( res => {

      this.setData({
        accountInfo: res.accountInfo
      });

    }).catch(err => {

      console.group();
      console.warn('Error updating account info');
      console.debug(err);
      console.groupEnd();

      setTimeout(this.refreshAccountInfo, 3000);

    }).finally(() => {

      wx.hideNavigationBarLoading();

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
        amountDue: 0,
        deposit: 0
      });

    } else {

      const selectedPrice = this.data.program.prices.find(price => {
        return price.id === id;
      });

      this.setData({
        selectedPrice: selectedPrice,
        amountDue: selectedPrice.price,
        deposit: this.calculateDeposit(selectedPrice),
        selectPriceWarningVisible: false  // Hide the warning if it was visible
      });

    }
  },

  /**
   * Calculate the deposit required to register for the trip under that price.
   * @param {Price} price 
   */
  calculateDeposit: function (price) {

    const adults = price.adults || 0,
      kids = price.kids || 0,
      perPerson = this.data.programGroup.location.international ? 5000 : 2000;

    return (adults + kids) * perPerson;

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

      // Check if we have valid verified contact information
      if ( app.globalData.accountInfoProvider.hasVerifiedContactInformation() ) {

        console.debug('The account contact information is verified, proceed with payment');

        // We have valid contact information, proceed with the payment
        this.processPayment();

      } else {

        console.debug('The account contact information is not verified, display warning');

        // We do not have verified contact information
        this.displayContactInfoWarning();

      }

    } else {

      console.debug('User trying to pay without selecting price, displaying warning');

      // The user has not selected a price, show a warning
      this.setData({
        selectPriceWarningVisible: true
      });

      setTimeout(this.hideSelectPriceWarning, 3000);

    }

  },

  /**
   * Warn the user that the contact information that we have for them may not be accurate and may not allow us to 
   * contact them.
   */
  displayContactInfoWarning: function () {

    this.setData({
      contactInfoModalVisible: true
    });

  },

  /**
   * Hide the contact info warning modal
   */
  hideContactInfoModal: function () {

    this.setData({
      contactInfoModalVisible: false
    });

  },

  /**
   * The user has been warned that their contact information may have problems
   * but still wants to proceed
   */
  proceedWithPayment: function () {

    console.debug('User selects to proceed with payment when warned that contact info may be inacurate');

    // Hide the modal and continue with the payment process
    this.hideContactInfoModal();
    this.processPayment();

  },

  /**
   * The user has selected to update their contact information when warned that
   * it may be inaccurate.
   */
  updateContactInfo: function () {

    console.debug('User selected updating contact information. Navigating to /pages/edit-account-details');

    this.hideContactInfoModal();

    // ref parameter is not used currently, leave it in case we use it in the future
    wx.navigateTo({
      url: '/pages/edit-account-details/edit-account-details?ref=program-registration',
    });
    
  },

  /** Hide the select price warning dialog */
  hideSelectPriceWarning: function () {

    // Make sure the warning is visible, it may have been hidden by selecting a price
    if (this.data.selectPriceWarningVisible) {

      console.debug('Hiding select price warning');

      this.setData({
        selectPriceWarningVisible: false
      });

    } else {

      console.debug('Called hideSelectPriceWarning() but warning was hidden already');

    }

  },

  /**
   * Process client payment for a given program.
   */
  processPayment: function () {

    const selectedPrice = this.data.selectedPrice,
      // amount = this.data.deposit,     // Clients only pay a deposit when registering
      amount = 1,                                // TODO fix this amount during testing, change back for production
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

        console.error(res);
        wx.showModal({
          title: '付款失败',
          content: '付款已取消，您可以随时从注册页面再次付款。',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.debug('"OK" is tapped')
            } else if (res.cancel) {
              console.debug('"Cancel" is tapped')
            }
          }
        });

      }
    });

  }
})
