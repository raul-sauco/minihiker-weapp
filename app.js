//app.js
const ProgramProvider = require('./helpers/programProvider.js');
const AccountInfoProvider = require('./helpers/accountInfoProvider.js');
const Logger = require('./helpers/logger.js');
const ENV = 'dev';

App({
  onLaunch: function () {
    this.globalData.accessToken = wx.getStorageSync('accessToken');

    this.globalData.logger = new Logger(this.globalData.url, ENV);
    if (this.globalData.accessToken) {
      this.globalData.logger.setAccessToken(this.globalData.accessToken);
    }

    // Get an instance of AccountInfoProvider
    this.globalData.accountInfoProvider = new AccountInfoProvider();
    this.globalData.accountInfoProvider.setApiUrl(this.globalData.url);
    this.globalData.accountInfoProvider.setLogger(this.globalData.logger);
    if (this.globalData.accessToken) {
      this.globalData.accountInfoProvider.setAccessToken(this.globalData.accessToken);
    }

    // Get an instance of ProgramProvider
    this.globalData.programProvider = new ProgramProvider();
    this.globalData.programProvider.setApiUrl(this.globalData.url);
    if (this.globalData.accessToken) {
      this.globalData.programProvider.setAccessToken(this.globalData.accessToken);
    }

    // Check if the user session is still valid
    wx.checkSession({
      success: res => {
        // Check if the accountInfoProvider needs to fetch an auth_token
        if (!this.globalData.accessToken) {          
          console.debug('User session is valid but no accessToken stored, requesting wx.login()');
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
   * Request user login against the wx backend. We will obtain a 
   * temporary JS code that can be sent to the minihiker.com backend
   * to obtain permanent user openid and temporary session_key.
   */
  requestLogin: function () {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.debug('wx.login returned code: ' + res.code);
        // Authenticate the user on the backend
        this.loginUser(res.code);
      },
      fail: err => {
        console.error('wx.login failed', err);
      }
    });
  },

  /** Send login information to the backend to authenticate user. */
  loginUser: function (code) {
    wx.request({
      url: this.globalData.url + 'wx-auth',
      method: 'POST',
      data: { jsCode:code },
      header: {'Content-Type':'application/json'},
      success: res => {
        console.debug(`Login success`);
        this.setAccessToken(res.data.access_token);        
      }
    });
  },

  /** Set globally the access token */
  setAccessToken: function (accessToken) {
    wx.setStorage({
      key: 'accessToken',
      data: accessToken,
      success: () => { console.debug('Saved user access token to storage.') },
      fail: () => { console.error('Failed to save user access token to storage.') }
    });
    this.globalData.accessToken = accessToken;
    this.globalData.programProvider.setAccessToken(accessToken);
    this.globalData.accountInfoProvider.setAccessToken(accessToken);
    this.globalData.logger.setAccessToken(accessToken);
  },

  /**
   * @deprecated, clients should switch to calling log directly on the 
   * logger instance.
   */
  log: function (data) {
    console.warn('Calling deprecated method app.log(), please update your code to use logger.log()');
    this.globalData.logger.log(data);
  },

  globalData: {
    accessToken: null,
    logger: null,
    programProvider: null,
    accountInfoProvider: null,
    payments: null,
    url: 'https://wxapiv1.minihiker.com/',
    resUrl: 'https://minihiker.com/webapp/',
    staticUrl: 'https://static.minihiker.com/',
    // url: 'http://wxapi.mh/',
    // resUrl: 'http://static.mh/',
    // staticUrl: 'http://static.mh/'
  }
})
