// pages/me/me.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    hasUserInfo: false,
    userInfo: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });

    console.log('this.hasUserInfo is set to ' + this.data.hasUserInfo);
    

    wx.setNavigationBarTitle({
      title: '我的'
    });
    
  },

  /**
   * If the user authorizes access to userInfo, we will get 
   * the userInfo on the event.
   */
  bindGetUserInfo: function (e) {

    let userInfo = e.detail.userInfo;

    // Set the info on the app
    app.globalData.userInfo = userInfo;
    app.globalData.hasUserInfo = true;

    // Call the application userInfoReadyCallback
    app.userInfoReadyCallback(userInfo);

    // Set the info on the page, will refresh the view
    this.setData({
      hasUserInfo: true,
      userInfo: userInfo,
    });

  },

  /**
   * Navigate to the personal information page.
   */
  navigateToPersonalInfoPage: function (e) {

    wx.navigateTo({
      url: '/pages/personal-information/personal-information',
    });
  }
})