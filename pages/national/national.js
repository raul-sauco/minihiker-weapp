//national.js
const app = getApp()

Page({
  data: {
    pageReady: false,
    programGroups: [],
    filters: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {

    // Force having user info
    if (!app.globalData.hasUserInfo) {
      console.log('Do not have user info: ');
      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      console.log('Have user info: ');
      console.log(app.globalData.hasUserInfo);
    }

    this.fetchActiveFilters();
    this.fetchProgramGroups();
  },

  /**
   * Lifecycle function--Called when page is shown
   */
  onShow: function () {
    // Force having user info
    if (!app.globalData.hasUserInfo) {

      console.debug('No user info found, redirecting to index page');
      wx.switchTab({
        url: '/pages/index/index',
      });

    }
  },

  /**
     * Fetch all the active program-types for the international programs.
     */
  fetchActiveFilters: function () {

    let endpoint = 'program-types?weapp-visible=true&int=false';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        console.log(res);

        let filters = [];

        // If the request is successful we should get a ProgramTypes array back
        // Create an filter array using active program-types
        res.data.forEach(pt => {
          filters.push({
            title: pt.name,
            active: false,
            query: {
              parameter: 'type',
              value: pt.name
            }
          });
        });

        // And add them to the data set, will refresh the UI
        this.setData({
          filters: filters
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
   * Fetch program groups from the server
   */
  fetchProgramGroups: function () {

    // TODO allow for pagination

    this.setData({
      pageReady: false
    });

    wx.showLoading({
      title: '下载中',
    });

    // We are fetching national programs
    let endpoint = 'program-groups?weapp_visible=true&int=false' + 
      '&expand=location,programs,type,programs.registrations,programs.period,programs.prices,arraywad,arraywap,arraywar';

    endpoint = this.addFiltersToEndpoint(endpoint);

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        // If the request is successful we should get a ProgramGroups array back
        // Add the ProgramGroups to the provider
        app.globalData.programProvider.addFromArray(res.data);

        // And add them to the data set, will refresh the UI
        this.setData({
          programGroups: res.data,
          pageReady: true
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
   * Change the active status of the clicked filter and refresh the programs based on the new 
   * filter.
   */
  toggleFilter: function (e) {

    let filter = e.currentTarget.dataset.filter;
    let filters = this.data.filters;

    filters.forEach(f => {

      if (f.title == filter) {
        // Toggle the current filter
        f.active = !f.active;
      } else {

        // Deactivate all other filters
        f.active = false;

      }

    });

    this.setData({
      filters: filters
    });

    this.fetchProgramGroups();

  },

  /**
   * Add filters to the request endpoint
   */
  addFiltersToEndpoint: function (endpoint) {

    // TODO allow for multiple filters

    this.data.filters.forEach(f => {

      if (f.active) {
        endpoint += '&' + f.query.parameter + '=' + f.query.value; 
      }
    });

    return endpoint;

  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.国内项目.',
      path: '/pages/national/national'
    };
  }

})
