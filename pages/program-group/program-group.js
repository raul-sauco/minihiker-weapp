// pages/program-group/program-group.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    selectedProgram: null,
    resUrl: app.globalData.resUrl,
    images: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      programGroup: app.globalData.programProvider.get(options.id),
      selectedProgram: app.globalData.programProvider.get(options.id).programs[0]
    });

    wx.setNavigationBarTitle({
      title: this.data.programGroup.weapp_display_name
    });

  },

  /** 
   * Change the selected program and refresh the UI
   */
  selectProgram: function (event) {

    this.setData({
      selectedProgram: this.data.programGroup.programs.find(
        p => p.id === event.currentTarget.dataset.programId
      )
    });

  },

  /**
   * Display the Q/A section related to this ProgramGroup.
   */
  showQA: function (event) {
    wx.navigateTo({
      url: '../program-group-qa/program-group-qa?id=' + this.data.programGroup.id,
    });
  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.' + this.data.programGroup.weapp_display_name,
      path: '/pages/program-group/program-group?id=' + this.data.programGroup.id
    };
  },

  /**
   * Register for the currently selected program of this ProgramGroup.
   */
  register: function (event) {
    wx.navigateTo({
      url: '/pages/program-registration/program-registration?pg=' + this.data.programGroup.id + 
        '&p=' + this.data.selectedProgram.id,
    });
  },

  /** Navigate home */
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})