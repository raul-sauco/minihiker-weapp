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
    selectedClients: [],
    ammountDue: 0
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

    p.formattedStartDate = this.formatDate(p.start_date);
    p.formattedEndDate = this.formatDate(p.end_date);

    this.setData({
      programGroup: pg,
      program: p,
      accountInfo: app.globalData.accountInfoProvider
    });
  },

  /**
   * Update the selected status of a client.
   */
  switchClientSelected: function (e) {

    let clientId = e.currentTarget.dataset.clientId;
    let selected = e.detail.value; // Boolean

    if (selected && !this.data.selectedClients.includes(clientId)) {

      // Add the client id to the array if selected an not previously there
      this.data.selectedClients.push(clientId);

    } else {

      if (this.data.selectedClients.includes(clientId)) {

        let key = this.data.selectedClients.findIndex( e => e == clientId);

        this.data.selectedClients.splice(key, 1);

      }

    }

    this.setData({
      ammountDue: this.data.program.price * this.data.selectedClients.length
    });

  },

  /**
   * Process client payment for a given program.
   */
  processPayment: function () {

    let selectedClients = this.data.selectedClients;
    let programId = this.data.program.id;
    let timestamp = Math.floor(Date.now() / 1000);
    let nonceStr = this.generateRandomString(12);

    wx.showLoading({
      title: '处理付款',
    });

    // TODO change this for real wx.requestPayment call
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '正在开发中',
        icon: "success"
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 2000);

    /**
    wx.requestPayment({
      'timeStamp': timestamp,
      'nonceStr': nonceStr,
      'package': '',
      'signType': 'MD5',
      'paySign': '',
      'success': function (res) {

        console.log(res);

      },
      'fail': function (res) {

        console.log(res);

      }
    });
    */

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