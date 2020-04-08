// pages/account-information/account-details.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    accountInfo: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  // onLoad: function (options) { },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

    this.fetchAccountInfo();

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

    this.fetchAccountInfo();

  },

  /**
   * Fetch the account information and store it.
   */
  fetchAccountInfo: function () {

    wx.showLoading({
      title: '下载中',
    });

    wx.showNavigationBarLoading();

    app.globalData.accountInfoProvider.fetchAccountInfo().then( res => {

      // Success res.accountInfo has the data
      this.setData({
        accountInfo: res.accountInfo
      });

    }).catch( err => {

      // Error
      if (err.code === 100) {

        // Wrong login status, request login and retry
        // No need to show a toast
        app.requestLogin();

      } else {

        // Inform of the problem
        wx.showToast({
          title: err.msg,
        });

      }

      // If we have ana error retry
      this.setTimeout(this.fetchAccountInfo, 3000);

    }).finally( () => {

      // Always 
      wx.hideLoading();
      wx.hideNavigationBarLoading();

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

  /** Navigate to the edit-account-details page */
  editAccountDetails: function () {
    wx.navigateTo({
      url: '/pages/edit-account-details/edit-account-details',
    });
  }

})
