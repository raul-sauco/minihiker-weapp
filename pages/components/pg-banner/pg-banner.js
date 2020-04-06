// pages/components/pg-banner/pg-banner.js
const app = getApp()

Component({
  /**
   * Component properties
   */
  properties: {
    int: {
      type: String
    }
  },

  /**
   * Component initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    programGroups: []
  },

  /**
   * Lifecycle method, will be called when the component
   * is attached to the view that calls it.
   */
  attached: function () {

    const url = app.globalData.url + 'wxbp?int=' + this.properties.int;
      // '&expand=location,programs,type,programs.registrations,programs.period,programs.prices,arraywad,arraywap,arraywar';
    
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      success: res => {

        if (res.statusCode === 200) {

          this.setData({
            programGroups: res.data
          });

          app.globalData.programProvider.addFromArray(res.data);

        } else {

          console.warn("Request successful but no programGroup[]");

        }

      },
      fail: res => {
        console.warn("Request failed: " + url);
      },
      complete: res => {
        console.debug("Request completed: " + url);
      }
    })
  },

  /**
   * Component methods
   */
  methods: {

    /**
     * Navigate to one ProgramGroup's page
     */
    showProgram: function (e) {
      wx.navigateTo({
        url: '/pages/program-group/program-group?id=' + e.currentTarget.dataset.id,
      });
    }

  }
})
