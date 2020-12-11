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

    // Start the periodical login status checks.
    this.checkLoginStatus();

    // Wait 60 seconds and check if the account name is the default.
    setTimeout(this.checkDefaultAccountName, 60000);
  },

  /**
   * Solve clients not being logged in properly error by checking periodically
   * the login status. Originally the app only checked on startup.
   */
  checkLoginStatus: function () {
    // Cancel the current timeout if any.
    const timeoutId = this.globalData.checkLoginStatusTimeoutId;
    if (timeoutId) {
      console.debug(`Cancelling current check login status timeout ${timeoutId}`);
      clearTimeout(timeoutId);
    }
    // Check if the user session is still valid
    console.debug('Checking loggin status');
    wx.checkSession({
      success: res => {
        // Check if the accountInfoProvider needs to fetch an auth_token
        if (!this.globalData.accessToken) {
          const message = 'User session is valid but no accessToken stored, requesting wx.login()';
          console.warn(message);
          this.globalData.logger.log({
            message,
            res,
            req: 'wx.checkSession()',
            extra: {'accountInfo' : this.globalData.accountInfoProvider.toString()},
            level: 1,
            page: 'app.js',
            method: 'checkLoginStatus',
            line: '60'
          });
          this.requestLogin();
        } else {
          // Current session is active and we have an access token.
          // Add slow periodic checks.
          this.globalData.checkLoginStatusTimeoutId = setTimeout(this.checkLoginStatus, 30000);
        }
      },
      fail: res => {
        // WX user session has expired, we need to renew the session_key
        console.debug('User session has expired, calling wx.login()');
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
        // Authenticate the user on the backend
        this.loginUser(res.code);
      },
      fail: err => {
        const message = 'wx.login() failed';
        this.globalData.logger.log({
          message,
          res: err,
          req: 'wx.login()',
          extra: { 'accountInfo': this.globalData.accountInfoProvider.toString() },
          level: 1,
          page: 'app.js',
          method: 'requestLogin',
          line: '100'
        });
        console.error(message, err);
      },
      complete: res => {
        // Set periodic login status checks.
        this.globalData.checkLoginStatusTimeoutId = setTimeout(this.checkLoginStatus, 30000);
      }
    });
  },

  /** Send login information to the backend to authenticate user. */
  loginUser: function (code) {
    const url = this.globalData.url + 'wx-auth';
    const method = 'POST';
    const data = { jsCode: code };
    const header = { 'Content-Type': 'application/json' };
    wx.request({
      url,
      method,
      data,
      header,
      success: res => {
        const accessToken = res.data.access_token;
        if (accessToken) {
          console.debug(`Obtained access token ${accessToken} from backend.`);
          this.setAccessToken(accessToken);
        } else {
          const message = `Unexpected backend login response. Access token '${accessToken}'`;
          this.globalData.logger.log({
            message,
            res,
            req: { url, method, data, header },
            extra: { 'accountInfo': this.globalData.accountInfoProvider.toString() },
            level: 1,
            page: 'app.js',
            method: 'loginUser',
            line: '140'
          });
          console.error(msg, res);
        }
        // YHT
        wx.setStorageSync('userId', res.data.user_id);
      },
      fail: err => {
        const message = 'Error loggin user in against MH backend.';
        this.globalData.logger.log({
          message,
          res: err,
          req: { url, method, data, header },
          extra: { 'accountInfo': this.globalData.accountInfoProvider.toString() },
          level: 1,
          page: 'app.js',
          method: 'loginUser',
          line: '155'
        });
        console.error(message, err);
      }
    });
  },

  /** Set globally the access token */
  setAccessToken: function (accessToken) {
    wx.setStorage({
      key: 'accessToken',
      data: accessToken,
      success: () => { console.debug('Saved user access token to storage.') },
      fail: () => {
        const message = 'Error saving user access token to storage.';
        this.globalData.logger.log({
          message,
          res: 'fail',
          req: 'wx.setStorage',
          extra: {
            'accountInfo': this.globalData.accountInfoProvider.toString(),
            key, data
          },
          level: 1,
          page: 'app.js',
          method: 'setAccessToken',
          line: '160'
        });        
        console.error(message);
      }
    });
    this.globalData.accessToken = accessToken;
    this.globalData.programProvider.setAccessToken(accessToken);
    this.globalData.accountInfoProvider.setAccessToken(accessToken);
    this.globalData.logger.setAccessToken(accessToken);
  },

  /**
   * Check if the clients have updated the default user name.
   */
  checkDefaultAccountName: function () {
    if (this.globalData.accountInfoProvider.name === '未注册') {
      wx.showModal({
        title: '请更新信息',
        content: '请点击确定按钮，修改您的昵称和微信号，方便报名活动后，我们邀请您进入活动群',
        success: res => {
          if (res.confirm) {
            // The user agrees to go update their details now.
            wx.navigateTo({
              url: '/pages/edit-account-details/edit-account-details',
            });
          }
        }
      });
    }
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
    resUrl: 'https://static.minihiker.com/',
    staticUrl: 'https://static.minihiker.com/',
    webviewUrl: 'https://backend.minihiker.com/',
    // url: 'http://wxapi.mh/',
    // resUrl: 'http://static.mh/',
    // staticUrl: 'http://static.mh/'

    /**
     * Store the ID of the current timeout for the checkLoginStatus to avoid 
     * having more than one timeout running at the same time.
     */
    checkLoginStatusTimeoutId: null,
  }
})
