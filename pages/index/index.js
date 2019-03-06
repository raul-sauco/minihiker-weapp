//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    programGroups: [],
    programProvider: app.globalData.programProvider,
    resUrl: null
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
      title: '获取数据',
    });
    
    // We are fetching international programs
    var endpoint = 'program-groups?weapp_visible=true&int=true&expand=location,programs,type,programs.registrations,programs.period';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.authToken
      },
      success: (res) => {

        // If the request is successful we should get ProgramGroups back 
        res.data.forEach(
          (pg) => {
            app.globalData.programProvider[pg.id] = pg;
            app.globalData.programProvider.reorderPrograms(pg);
          }
        );
          
        this.setData({
          resUrl: app.globalData.resUrl,
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
