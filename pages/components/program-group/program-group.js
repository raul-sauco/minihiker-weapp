// pages/components/program-group/program-group.js
const app = getApp()

Component({
  /**
   * Component properties
   */
  properties: {
    programGroupId: {
      type: Number
    }
  },

  /**
   * Component initial data
   */
  data: {
    resUrl: app.globalData.resUrl,
    programGroup: null
  },

  /**
   * Lifecycle method, will be called when the component
   * is attached to the view that calls it.
   */
  attached: function () {
    this.setData({
      programGroup: app.globalData.programProvider.get(this.properties.programGroupId)
    });
  },

  /**
   * Component methods
   */
  methods: {

    /**
     * Navigate to one ProgramGroup's page
     */
    showProgram: function (event) {
      wx.navigateTo({
        url: '../program-group/program-group?id=' + event.currentTarget.dataset.programGroupId,
      });
    }

  }
})
