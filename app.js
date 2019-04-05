//app.js

const ProgramProvider = require('./helpers/programProvider.js');

App({
  onLaunch: function () {
    // 展示本地存储能力
    /*
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    */

    let user = wx.getStorageSync('user');

    if (user) {

      // We have user info in storage
      this.globalData.userInfo = user;
      this.globalData.hasUserInfo = true;
      
    } else {

      // Get user info if the user has authorized it previously
      this.obtainUserInfo();

    }

    // Get an instance of ProgramProvider
    this.globalData.programProvider = new ProgramProvider();

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('wx.login returned code: ' + res.code);

        // Authenticate the user on the backend
        this.loginUser(res.code);
      }
    });
  },

  /**
   * Obtain the user's information if the permission has been
   * granted previously.
   * 
   * This function does not ask for permission, if it has not 
   * been granted previously, it will wait until the information
   * is needed.
   */
  obtainUserInfo: function () {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              this.globalData.hasUserInfo = true;

              // Try to create the object
              wx.setStorage({
                key: 'user',
                data: res.userInfo,
                success: () => {console.log('Saved user information to storage.')},
                fail: () => {console.log('Failed to save user information to storage.')}
              });

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
  },

  /**
   * The user information is ready
   */
  userInfoReadyCallback: function (res) {
    console.log('app: userInfoReadyCallback has been invoked');
    console.log(res);
  },

  /**
   * Send login information to the backend to authenticate user.
   */
  loginUser: function (code) {

    let endpoint = 'wx-auth';

    // Send the code to the backend to login
    wx.request({
      url: this.globalData.url + endpoint,
      method: 'POST',
      data: {jsCode:code},
      success: res => {

        // Check that we get the expected response
        console.log('User logged in on backend');
        console.log(res);

      }
    });

  },

  globalData: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    programProvider: null,
    url: 'https://minihiker.com/api/',
    resUrl: 'https://minihiker.com/webapp/'
  }
})