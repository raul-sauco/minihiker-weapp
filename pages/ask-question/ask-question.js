// pages/ask-question/ask-question.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
    userInfo: null,
    programGroup: null,
    loading: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo,
      programGroup: app.globalData.programProvider.get(options.id)
    });

    wx.setNavigationBarTitle({
      title: '问答'
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

    // Set the info on the page, will refresh the view
    this.setData({
      hasUserInfo: true,
      userInfo: userInfo,
    });

  },

  /**
   * Bind input event function
   * TODO will use this function to display characters left.
   */
  bindInput: function (e) {
    console.log(e.detail);
  },

  /**
   * Grab the question text created by the user from the text
   * area and send it to the server to create a new Qa.
   */
  sendQa: function (e) {

    // Update the UI
    this.setData({
      loading: true
    });

    // Build the question
    let qa = {
      program_group_id: this.data.programGroup.id,
      question: e.detail.value.textarea,
      user_avatar_url: this.data.userInfo.avatarUrl,
      user_nickname: this.data.userInfo.nickName
    };

    let endpoint = 'qas';

    let header = {
      'Content-Type': 'application/json'
    };

    wx.request({
      url: app.globalData.url + endpoint,
      data: qa,
      method: 'POST',
      header: header,
      success: res => {

        // res.data should have the new qa
        console.log(res);
        
        // TODO check for errors on the response
        // Add the new qa to the ProgramGroup
        let pg = app.globalData.programProvider.get(this.data.programGroup.id);
        pg.qas.push(res.data);

        // Refresh the UI
        this.setData({
          programGroup: pg,
          loading: false
        });

        wx:wx.navigateBack({
          delta: 1,
        });

      },
      fail: res => {
        console.warn('Request failed. ' + app.globalData.url + endpoint);
      },
      complete: res => {
        console.log('Request completed. ' + app.globalData.url + endpoint);
      }
    });
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