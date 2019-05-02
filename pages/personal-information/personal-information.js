// pages/personal-information/personal-information.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    client: {},
    focusNameInput: true,
    accountInfo: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    // TODO use the client id to check if it is an update or create situation

    this.setData({
      focusNameInput: true,
      client: {
        name_zh: 'Client name_zh',
        nickname: 'Client nickname'
      },
      accountInfo: app.globalData.accountInfo
    });

  },

  /**
   * Handler for the blur event on the Client's name input field
   */
  updatePI: function (e) {
    console.log(e);
    console.log(this.data.client);
    console.log(this.data.accountInfo);

    let attr = e.target.dataset.attr;
    let updatedValue = e.detail.value;
    let oldValue = this.data.client[attr];

    console.log('Attribute is ' + attr);
    console.log('Updated value is ' + updatedValue);
    console.log('Old value is ' + oldValue);
    
    if (!oldValue || oldValue !== updatedValue) {

      console.log('The user has updated ' + attr + ' value from ' + this.data.client[attr] + ' to ' + updatedValue);
      this.data.client[attr] = updatedValue;

      this.saveUpdatedClientInfo();

    } else {

      console.log('User information was not updated');

    }
  },

  /**
   * Save the updated client information on all relevant places.
   */
  saveUpdatedClientInfo: function () {

    console.log('Saving client information');

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})