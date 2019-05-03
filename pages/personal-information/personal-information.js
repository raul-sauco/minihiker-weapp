// pages/personal-information/personal-information.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    client: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    let title = '创建新营员';
    let client = {};

    if (options.id) {

      // The page was called with a Client Id as a parameter, is an update
      client = app.globalData.accountInfoProvider.getClient(options.id);

      if (client.nickname) {
        title = '更新 ' + client.nickname;
      } else if (client.name_zh) {
        title = '更新 ' + client.name_zh;
      } else {
        title = '更新 ' + client.id;
      }
      
    }

    this.setData({
      client: client
    });

    wx.setNavigationBarTitle({
      title: title,
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