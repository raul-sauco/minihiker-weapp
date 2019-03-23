//index.js
const app = getApp()

Page({
  data: {
    programProvider: app.globalData.programProvider,
    programGroups: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {    
    this.fetchProgramGroups();
  },

  /**
   * Fetch program groups from the server
   */
  fetchProgramGroups: function() {

    // TODO allow for pagination

    wx.showLoading({
      title: '下载中',
    });
    
    // We are fetching international programs
    var endpoint = 'program-groups?weapp_visible=true&int=true&expand=location,programs,type,programs.registrations,programs.period';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        // If the request is successful we should get a ProgramGroups array back
        // Add the ProgramGroups to the provider
        app.globalData.programProvider.addFromArray(res.data);
        
        // And add them to the data set, will refresh the UI
        this.setData({
          programGroups: res.data
        });

        wx.hideLoading();
      },
      fail: (res) => {
        console.warn('Request failed. ' + app.globalData.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + app.globalData.url + endpoint);
      }
    });

  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.国际项目.',
      path: '/pages/index/index'
    };
  }
})
