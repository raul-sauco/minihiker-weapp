// pages/program-group-qa/program-group-qa.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    programProvider: app.globalData.programProvider,
    programGroup: null,
    qas: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      programGroup: app.globalData.programProvider[options.id]
    });

    wx.setNavigationBarTitle({
      title: this.data.programGroup.weapp_display_name + '问答'
    });

    // TODO get rid of the next block of logs

    if (this.data.programGroup.qaFetchTimestamp === undefined) {
      console.log('qaFetchTimestamp is undefined, fetching qa');
      this.fetchProgramGroupQa();
    } else {
      console.log('qaFetchTimestamp is not undefined');
    }
  },

  /**
   * Fetch the Current ProgramGroup's Qa and add a timestamp 
   * recording when they were last fetched.
   */
  fetchProgramGroupQa: function () {

    // Fetching server data, display a loader
    wx.showLoading({
      title: '获取数据',
    });

    let endpoint = 'qas?program_group=' + this.data.programGroup.id;

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        // Store the Qas on the Program Group and save the fetch time
        this.data.programGroup.qas = res.data;
        this.data.programGroup.qaFetchTimestamp = new Date();

        // Create a human-readable time-ago string from the timestamp
        this.data.programGroup.qas.forEach(qa => {
          qa.asked = this.ago(qa.created_at);
        });

        // If the request is successful we should get ProgramGroup Qas
        this.setData({
          qas: this.data.programGroup.qas
        });

      },
      fail: (res) => {
        console.warn('Request failed. ' + app.globalData.url + endpoint);
      },
      complete: (res) => {

        // Hide the loader
        wx.hideLoading();
        
        console.log('Request completed. ' + app.globalData.url + endpoint);
      }
    })
  }, 
  
  /**
   * See 
   * https://github.com/odyniec/tinyAgo-js/blob/master/tinyAgo.js
   */
  ago: function (phpts) {
    let val = phpts * 1000; // Convert PHP timestamp (seconds) to ms
    val = 0 | (Date.now() - val) / 1000;
    /* var unit, length = {
      second: 60, minute: 60, hour: 24, day: 7, week: 4.35,
      month: 12, year: 10000
    }, result;
    */

    var unit, length = {
      秒: 60, 分钟: 60, 小时: 24, 天: 7, 星期: 4.35,
      月: 12, 年: 10000
    }, result;

    for(unit in length) {
      result = val % length[unit];
      if (!(val = 0 | val / length[unit]))
        return result + ' ' + unit + '前';
    }
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