//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    programGroups: [],
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
    var endpoint = 'program-groups?weapp_visible=true&int=true&expand=location,programs,type,programs.registrations.programs.period';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.authToken
      },
      success: (res) => {
        // If the request is successful we should get programGroups back   
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

  },

  /**
   * Navigate to one ProgramGroup's page
   */
  showProgram: function (event) {

    var targetProgramGroupId = event.currentTarget.dataset.programGroupId;

    var pg = this.data.programGroups.find(item => {
      return item.id === parseInt(targetProgramGroupId, 10);
    });

    // Set the ProgramGroup on the provider
    app.globalData.programProvider[pg.id] = pg;

    wx.navigateTo({
      url: '../program-group/program-group?id=' + targetProgramGroupId,
    });
  },
})
