// pages/account-information/account-details.js
const app = getApp()

Page({

  /** Page initial data */
  data: {
    resUrl: app.globalData.resUrl,
    accountInfo: null
  },

  /** Lifecycle function--Called when page show */
  onShow: function () {
    this.fetchAccountInfo();
  },

  /** Page event handler function--Called when user drop down */
  onPullDownRefresh: function () {
    this.fetchAccountInfo();
  },

  /** Fetch the account information and store it */
  fetchAccountInfo: function () {
    if (app.globalData.accountInfoProvider.ready()) {
      wx.showLoading({
        title: '下载中',
      });
      wx.showNavigationBarLoading();
      app.globalData.accountInfoProvider.fetchAccountInfo().then(res => {
        this.setData({
          accountInfo: res.accountInfo
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      }).catch(err => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        if (err.code === 100) {
          // Wrong login status, request login and retry
          // No need to show a toast
          app.checkLoginStatus();
        }
        // Always show the error.
        console.error(err.msg, err);
        wx.showToast({
          title: err.msg,
        });
        this.setTimeout(this.fetchAccountInfo, 3000);
        app.globalData.logger.log({
          message: 'Error updating account information from provider',
          res: err,
          req: 'accountInfoProvider.fetchAccountInfo()',
          extra: { 'accountInfo': app.globalData.accountInfoProvider.toString() },
          level: 1,
          page: 'account-details.js',
          method: 'fetchAccountInfo',
          line: '55'
        });
      });
    } else {
      const message = 'Account info provider not ready when expected.';
      app.globalData.logger.log({
        message,
        res: 'Account info provider ready "false"',
        req: 'accountInfoProvider.fetchAccountInfo()',
        extra: { 'accountInfo': app.globalData.accountInfoProvider.toString() },
        level: 1,
        page: 'account-details.js',
        method: 'fetchAccountInfo',
        line: '70'
      });
      console.error(message);
    }
  },

  /** Navigate to the personal-info page to add a new client PI */
  addClient: function () {
    wx.navigateTo({
      url: '/pages/personal-information/personal-information',
    });
  },

  /** Navigate to the personal-info page to perform a client PI update */
  updateClient: function (e) {
    wx.navigateTo({
      url: '/pages/personal-information/personal-information?id=' + e.currentTarget.dataset.clientId
    })
  },

  /** Navigate to the edit-account-details page */
  editAccountDetails: function () {
    wx.navigateTo({
      url: '/pages/edit-account-details/edit-account-details',
    });
  }

})
