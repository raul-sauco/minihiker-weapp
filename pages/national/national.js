//index.js
const app = getApp()

Page({
  data: {
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
  fetchProgramGroups: function () {

    // TODO allow for pagination

    wx.showLoading({
      title: '获取数据',
    });

    // We are fetching national programs
    var endpoint = 'program-groups?weapp_visible=true&int=false&expand=location,programs,type,programs.registrations,programs.period';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.authToken
      },
      success: (res) => {

        // If the request is successful we should get programGroups back 
        res.data.forEach(
          (pg) => {
            app.globalData.programProvider[pg.id] = pg;
            app.globalData.programProvider.reorderPrograms(pg);
          }
        );

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

  }

})
