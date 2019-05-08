//app.js

const ProgramProvider = require('./helpers/programProvider.js');
const AccountInfoProvider = require('./helpers/accountInfoProvider.js');

App({
  onLaunch: function () {

    this.globalData.accessToken = wx.getStorageSync('accessToken');

    // Get an instance of AccountInfoProvider
    this.globalData.accountInfoProvider = new AccountInfoProvider();

    // Get an instance of ProgramProvider
    this.globalData.programProvider = new ProgramProvider();

    // Get user information if we have it on storage
    this.fetchUserData();

    // Check if the user session is still valid
    wx.checkSession({
      success: res => {

        // Check if the accountInfoProvider needs to fetch an auth_token
        if (!this.globalData.accessToken) {
          
          console.log('User session is valid but no accessToken stored, requesting wx.login()');
          this.requestLogin();

        }
      },
      fail: res => {

        // WX user session has expired, we need to renew the session_key
        console.log('User session has expired, calling wx.login()');
        this.requestLogin();
      }
    });

  },

  /**
   * Recover the user information from storage if present there
   */
  fetchUserData: function () {

    wx.getStorage({
      key: 'user',
      success: (res) => {

        if (res.data) {

          // We have user info in storage
          this.globalData.userInfo = res.data;
          this.globalData.hasUserInfo = true;

        } else {

          // Get user info if the user has authorized it previously
          this.obtainUserInfo();

        }

      },
      fail: (res) => {
        this.obtainUserInfo();
      }
    });

  },

  /**
   * Request user login against the wx backend. We will obtain a 
   * temporary JS code that can be sent to the minihiker.com backend
   * to obtain permanent user openid and temporary session_key.
   */
  requestLogin: function () {

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

    // Try to create the object
    wx.setStorage({
      key: 'user',
      data: this.globalData.userInfo,
      success: () => { console.log('Saved user information to storage.') },
      fail: () => { console.log('Failed to save user information to storage.') }
    });

    // TODO send the information to the server to update username
  },

  /**
   * Send login information to the backend to authenticate user.
   */
  loginUser: function (code) {

    let endpoint = 'wx-auth';

    // Send the code to the backend to login, add user data
    wx.request({
      url: this.globalData.url + endpoint,
      method: 'POST',
      data: {
        jsCode:code,
        userInfo:this.globalData.userInfo
      },
      header: {'Content-Type':'application/json'},
      success: res => {

        // Check that we get the expected response
        console.log('Success loggin in user' + res.data.username + ' on backend');
        console.log(res);

        // Save the access_token
        this.globalData.accessToken = res.data.access_token;

        // Try to create the object
        wx.setStorage({
          key: 'accessToken',
          data: res.data.access_token,
          success: () => { console.log('Saved user access token to storage.') },
          fail: () => { console.log('Failed to save user access token to storage.') }
        });

        // Let the accountInfoProvider check if the data needs to be refrehed
        this.globalData.accountInfoProvider.setAccountId(res.data.family_id);
        
      }
    });

  },

  globalData: {
    userInfo: null,
    hasUserInfo: false,
    accessToken: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    programProvider: null,
    accountInfoProvider: null,
    url: 'https://minihiker.com/api/',
    resUrl: 'https://minihiker.com/webapp/'
  }
})