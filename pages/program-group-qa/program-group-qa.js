// pages/program-group-qa/program-group-qa.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    qas: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      programGroup: app.globalData.programProvider.get(options.id)
    });

    wx.setNavigationBarTitle({
      title: '问答 ' + this.data.programGroup.weapp_display_name
    });

    // TODO get rid of the next block of logs

    if (this.data.programGroup.qaFetchTimestamp === undefined) {
      console.log('qaFetchTimestamp is undefined, fetching qa');
      this.fetchProgramGroupQa();
    } else {
      console.log('qaFetchTimestamp is not undefined');
      this.setData({
        qas: this.data.programGroup.qas
      });
    }
  },

  /**
   * Fetch the Current ProgramGroup's Qa and add a timestamp 
   * recording when they were last fetched.
   */
  fetchProgramGroupQa: function () {

    // Fetching server data, display a loader
    wx.showLoading({
      title: '下载中',
    });

    let endpoint = 'qas?program_group=' + this.data.programGroup.id;

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        // If the request is successful we should get ProgramGroup Qas

        // Get the ProgramGroup from the provider
        let pg = app.globalData.programProvider.get(this.data.programGroup.id);

        // Store the Qas on the Program Group and save the fetch time
        pg.qas = res.data;
        pg.qaFetchTs = Math.round(new Date().getTime()/1000);

        // Create a human-readable time-ago string from the timestamp
        pg.qas.forEach(qa => {
          qa.asked = this.ago(qa.created_at);
        });

        this.setData({
          qas: pg.qas
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
   * Allow the user to send a QA related to this ProgramGroup
   */
  askQuestion: function () {
    wx.navigateTo({
      url: '../ask-question/ask-question?id=' + this.data.programGroup.id,
    });
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
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.' + this.data.programGroup.weapp_display_name + '.问答.',
      path: '/pages/program-group-qa/program-group-qa?id=' + this.data.programGroup.id
    };
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

    // Refresh the UI with all the qa
    if (this.data.qas) {
      this.setData({
        qas: app.globalData.programProvider.get(this.data.programGroup.id).qas
      });
    }

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    console.log('TODO reload questions');
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    console.log('TODO load more QAs when the user reaches the bottom');
  }
})