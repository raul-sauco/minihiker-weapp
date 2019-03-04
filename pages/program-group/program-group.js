// pages/program-group/program-group.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    programProvider: app.globalData.programProvider,
    programGroup: null,
    images: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      programGroup: app.globalData.programProvider[options.id]
    });

    wx.setNavigationBarTitle({
      title: this.data.programGroup.weapp_display_name
    });

    var endpoint = 'images?program_group_id=' + this.data.programGroup.id;

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.authToken
      },
      success: (res) => {
        // If the request is successful we should get programgroup images back
        this.setData({
          images: res.data
        });
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
   * Navigate to one Program's page
   */
  showProgram: function (event) {

    var targetProgramId = event.currentTarget.dataset.programId;

    console.log('Navigating to program ' + targetProgramId);

/*
    var pg = this.data.programGroups.find(item => {
      return item.id === parseInt(targetProgramId, 10);
    });

    // Set the ProgramGroup on the provider
    app.globalData.programProvider[pg.id] = pg;
*/
    wx.navigateTo({
      url: '../program/program?id=' + targetProgramId,
    });
  },
})