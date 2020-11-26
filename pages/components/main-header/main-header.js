const app = getApp()

Component({
  /** Component properties */
  properties: { 
    name: null,
    avatar: null,
  },

  /** Component initial data */
  data: {
    accountInfo: app.globalData.accountInfoProvider,
    staticUrl: app.globalData.staticUrl,
    preventNavigation: false
  },

  /**
   * Lifecycle method, will be called when the component
   * is attached to the view that calls it.
   */
  attached: function () {
    // Prevent navigation if already on the edit account page.
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const url = `/${currentPage.route}`;
    this.setData({
      accountInfo: app.globalData.accountInfoProvider,
      preventNavigation: url.includes('edit-account-details')
    });
  },

  /** Component methods */
  methods: {
    /** Navigate to edit-account-details */
    editAccountDetails: function () {
      if (!this.data.preventNavigation) {
        wx.navigateTo({
          url: '/pages/edit-account-details/edit-account-details',
        });
      }
    }
  }
})
