// pages/trip.js
var trips = require('../../helpers/tripProvider.js').trips;

Page({

  /**
   * Page initial data
   */
  data: {
    haveTrip: false,
    trip: {},
    images: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    
    // Set the trip
    this.setData({
      trip: trips[options.id -1]
    });

    // If the trip was setup correctly use the data
    if (this.data.trip !== {}) {

      console.debug('Displaying details for trip ' + this.data.trip.id);
      this.setData({haveTrip: true});

      wx.setNavigationBarTitle({
        title: this.data.trip.name,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      });

      this.generateFakeImages();

    } else {

      console.warn('Could not obtain trip ' + options.id);
      wx.setNavigationBarTitle({
        title: '错误',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
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

  },

  /**
   * Handle clicks on the trip thumbnail images
   */
  clickImage: function (e) {
    // TODO implement this function
    console.log('Registered click on ' + e.currentTarget.dataset.imageid);
  },

  generateFakeImages: function () {
    
    var total = 100;
    var url = 'https://placeimg.com/50/50/nature/';
    var images = [];

    for (var i=0 ; i < total ; i++) {      
      images.push(url + i);
    }

    this.setData({images: images});
  }
})