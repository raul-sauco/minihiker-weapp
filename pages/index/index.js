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

    /*
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    */
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
          programGroups: res.data,
          isRegistrationOpen: this.isRegistrationOpen
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

    var targetProgramId = event.currentTarget.dataset.programid;

    var pg = this.data.programGroups.find(item => {
      return item.id === parseInt(targetProgramId, 10);
    });

    // Set the ProgramGroup on the provider
    app.globalData.programProvider[pg.id] = pg;

    wx.navigateTo({
      url: '../program/program?id=' + targetProgramId,
    });
  },
})
