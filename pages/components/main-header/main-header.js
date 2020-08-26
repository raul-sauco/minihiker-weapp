const app = getApp()

Component({
  /** Component properties */
  properties: { },

  /** Component initial data */
  data: {
    accountInfo: app.globalData.accountInfoProvider,
    staticUrl: app.globalData.staticUrl
  },

  /**
   * Lifecycle method, will be called when the component
   * is attached to the view that calls it.
   */
  attached: function () {
    this.setData({
      accountInfo: app.globalData.accountInfoProvider
    });
  },

  /** Component methods */
  methods: { }
})
