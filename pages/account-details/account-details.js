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
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '会员信息',
    });

    this.fetchAccountInfo();

  },

  /**
   * Fetch the account information and store it.
   */
  fetchAccountInfo: function () {

    let endpoint = 'families/' + app.globalData.accountInfoProvider.id + '?expand=clients';
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

        // If the request fails, try again after 5 seconds
        setTimeout(this.fetchAccountInfo, 5000);
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

    app.globalData.accountInfoProvider.saveFromServerResponse(accountInfo);

    // Set data to update the user interface.
    this.setData({
      accountInfo: app.globalData.accountInfoProvider
    });

  },

  /**
   * Navigate to the personal-info page to add a new client PI.
   */
  addClient: function () {
    wx.navigateTo({
      url: '/pages/personal-information/personal-information',
    });
  },

  /**
   * Navigate to the personal-info page to perform a client PI update
   */
  updateClient: function (e) {

    wx.navigateTo({
      url: '/pages/personal-information/personal-information?id=' + e.currentTarget.dataset.clientId
    })
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