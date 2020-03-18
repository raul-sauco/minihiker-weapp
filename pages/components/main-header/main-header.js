const app = getApp()

Component({
  /**
   * Component properties
   */
  properties: {

  },

  /**
   * Component initial data
   */
  data: {
    accountInfo: app.globalData.accountInfoProvider,
    resUrl: app.globalData.resUrl,
    hasUserInfo: false,
    userInfo: null
  },

  /**
   * Lifecycle method, will be called when the component
   * is attached to the view that calls it.
   */
  attached: function () {
    this.setData({
      accountInfo: app.globalData.accountInfoProvider,
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });
  },

  /**
   * Component methods
   */
  methods: {

  }
})
