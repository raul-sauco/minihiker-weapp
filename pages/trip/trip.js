// pages/trip.js
var trips = require('../../helpers/tripProvider.js').trips;

Page({

  /**
   * Page initial data
   */
  data: {
    haveTrip: false,
    trip: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    // console.log(options);
    this.setData({
      trip: trips[options.id -1]
    });

    if (this.data.trip !== {}) {
      console.debug('Displaying details for trip ' + this.data.trip.id);
      this.setData({haveTrip: true});
    } else {
      console.warn('Could not obtain trip ' + options.id);
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})