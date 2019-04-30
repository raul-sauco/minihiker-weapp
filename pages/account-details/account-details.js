// pages/account-information/account-details.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    accountInfo: null,
  },

  /**
   * User has submitted the personal information form.
   */
  piFormSubmit: function (e) {
    console.log('form has encountered a submit event. The carried value is: ', e.detail.value)
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '帐户信息',
    });

    this.fetchAccountInfo();

  },

  /**
   * Fetch the account information and store it.
   */
  fetchAccountInfo: function () {

    let endpoint = 'families/' + app.globalData.accountInfo.id + '?expand=clients';
    let url = app.globalData.url + endpoint;

    let header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
    };

    wx.showLoading({
      title: '下载中',
    });

    wx.request({
      url: app.globalData.url + endpoint,
      header: header,
      method: 'GET',
      success: res => {        
        this.saveAccountInfoToStorage(res.data);
      },
      fail: res => {
        console.warn('Error fetching family ' + app.globalData.accountInfo.id);
        console.info(res);
      },
      complete: res => {
        wx.hideLoading();
      }
    });

  },

  /**
   * Save the account information to storage.
   */
  saveAccountInfoToStorage: function (accountInfo) {

    accountInfo.updated_ts = Date.now();

    // Set data to update the user interface.
    this.setData({
      accountInfo: accountInfo
    });

    wx.setStorage({
      key: 'accountInfo',
      data: accountInfo,
      success: () => { console.log('Saved account info to storage.') },
      fail: () => { console.log('Failed to save account info to storage.') }
    });

  },

  /**
   * Navigate to the add client page.
   */
  addClient: function () {
    console.log('Add client tap');
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