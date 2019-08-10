// pages/my-programs/my-programs.js
const app = getApp();
const utils = require('../../utils/util.js');

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    programs: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.fetchPrograms();
  },

  fetchPrograms: function () {
    // TODO allow for pagination

    wx.showLoading({
      title: '下载中',
    });

    // We are fetching international programs
    let endpoint = 'my-programs?expand=programGroup,participants&per-page=50';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: (res) => {

        // Format the program dates
        res.data.forEach(p => {
          p.start_date = utils.formatDate(p.start_date);
          p.end_date = utils.formatDate(p.end_date);
        });

        // And add them to the data set, will refresh the UI
        this.setData({
          programs: res.data
        });

      },
      fail: (res) => {
        console.warn('Request failed. ' + app.globalData.url + endpoint);
      },
      complete: (res) => {
        wx.hideLoading();
        console.log('Request completed. ' + app.globalData.url + endpoint);
      }
    });
  }
})