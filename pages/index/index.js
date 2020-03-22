//index.js
const app = getApp()

Page({
  data: {
    canIUseUserInfo: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: null,
    userInfo: null,
    pageReady: false,
    hasNextPage: false,
    nextPageNumber: null,
    resUrl: app.globalData.resUrl,
    programGroups: [],
    filters: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });

    this.fetchActiveFilters();
    this.fetchProgramGroups();
  },

  /**
   * Fetch all the active program-types for the international programs.
   */
  fetchActiveFilters: function () {

    const endpoint = 'program-types?weapp-visible=true&int=true&upcomi';

    wx.request({
      url: app.globalData.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {

        const filters = [];

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
        console.debug('Request completed. ' + app.globalData.url + endpoint);
      }
    });

  },

  /**
   * Fetch program groups from the server
   */
  fetchProgramGroups: function(searchQuery = '', page = 1) {

    console.log('inside fetchProgramGroup q: ' + searchQuery + ' page: ' + page);

    this.setData({
      pageReady: false
    });

    wx.showLoading({
      title: '下载中',
    });

    // TODO add filters
    const params = {
      int: 'true',
      page: page,
      'per-page': 2,  // TODO remove after implementing pagination
      expand: 'location,programs,type,programs.registrations,programs.period,programs.prices,arraywad,arraywap,arraywar'
    };

    if (searchQuery) {
      params.q = searchQuery;
    }

    app.globalData.programProvider.fetchProgramGroups(params).then(res => {

      // And add them to the data set, will refresh the UI
      this.setData({
        hasNextPage: res.hasNextPage,
        nextPageNumber: res.nextPageNumber,
        programGroups: this.data.programGroups.concat(res.programGroups),
        pageReady: true
      });

      wx.hideLoading();

    }).catch(err => {

      wx.hideLoading();
      wx.showToast({
        icon: 'none',
        title: err.msg,
      });
      
      // TODO implement retry

    });

    // endpoint = this.addFiltersToEndpoint(endpoint);

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
   * If the user authorizes access to userInfo, we will get 
   * the userInfo on the event.
   */
  bindGetUserInfo: function (e) {

    let userInfo = e.detail.userInfo;

    // Set the info on the app
    app.globalData.userInfo = userInfo;
    app.globalData.hasUserInfo = true;

    // Call the application userInfoReadyCallback
    app.userInfoReadyCallback(userInfo);

    // Set the info on the page, will refresh the view
    this.setData({
      hasUserInfo: true,
      userInfo: userInfo,
    });

  },

  /** 
   * Used during development to navigate quickly to page currently under development.
   */
  go: function () {
    // Display payment confirmation
    wx.navigateTo({
      // url: '/pages/official-account/official-account'
      // url: '/pages/about-minihiker/about-minihiker'
      // url: '/pages/cs-phones/cs-phones'
      url: '/pages/confirm-payment/confirm-payment?pg=679&p=926&price=210'
    });

  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.国际项目.',
      path: '/pages/index/index'
    };
  }
})
