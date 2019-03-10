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

    // Get the images from the server TODO check cache
    this.fetchImages();

  },

  /**
   * Fetch this ProgramGroup's images from the server.
   */
  fetchImages: function () {

    let endpoint = 'images?program_group_id=' + this.data.programGroup.id;

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.authToken
      },
      success: (res) => {

        // If the request is successful we should get programgroup images back

        // Get the ProgramGroup from the provider
        let pg = app.globalData.programProvider.get(this.data.programGroup.id);

        // Store the Qas on the Program Group and save the fetch time
        pg.images = res.data;
        pg.imgFetchTs = Math.round(new Date().getTime() / 1000);

        this.setData({
          images: pg.images
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
   * Contact customer service with the ProgramGroup information.
   */
  contactCS: function (event) {
    console.log('Contact customer service for program ' + this.data.selectedProgram.id);
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
    console.log('Register for program ' + this.data.selectedProgram.id);
  }
})