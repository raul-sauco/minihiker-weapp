//index.js
const app = getApp()

Page({
  data: {
    canIUseUserInfo: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: null,
    userInfo: null,
    loadingPrograms: true,
    hasNextPage: false,
    nextPageNumber: null,
    searchQuery: '',
    resUrl: app.globalData.resUrl,
    programGroups: [],
    filters: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    this.setUserInfo();
    this.fetchActiveFilters();
    this.fetchProgramGroups(null, null);
  },

  /**
   * Set the user info or poll for it if not ready
   */
  setUserInfo: function () {
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });
    if (this.data.hasUserInfo === false) {
      console.debug('hasUserInfo is false, setting timeout');
      setTimeout(this.setUserInfo, 300);
    }
  },

  /**
   * Fetch all the active program-types for the international programs.
   */
  fetchActiveFilters: function () {

    wx.showLoading({
      title: '下载中',
    });

    const endpoint = 'program-types?weapp-visible=true&int=true';

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
            active: false
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
        wx.hideLoading();
        console.debug('Request completed. ' + app.globalData.url + endpoint);
      }
    });

  },

  /**
   * Fetch program groups from the server
   */
  fetchProgramGroups: function(searchQuery, page) {

    this.setData({
      loadingPrograms: true
    });

    // TODO add filters
    const params = {
      int: 'true',
      'per-page': 3,  // TODO remove after implementing pagination
    };

    if (searchQuery) {
      params.q = searchQuery;
    }

    if (page) {
      params.page = page;
    }

    const typeFilters = this.getTypeFilteringValue();
    if (typeFilters) {
      params.type = typeFilters;
    }

    app.globalData.programProvider.fetchProgramGroups(params).then(res => {

      // And add them to the data set, will refresh the UI
      this.setData({
        hasNextPage: res.hasNextPage,
        nextPageNumber: res.nextPageNumber,
        programGroups: this.data.programGroups.concat(res.programGroups),
        loadingPrograms: false
      });

    }).catch(err => {

      wx.showToast({
        icon: 'none',
        title: err.msg,
      });
      
      setTimeout(this.fetchProgramGroups, 3000, searchQuery, page);

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
      filters: filters,
      programGroups: [],      // Clean up programGroups, will get a new set
      loadingPrograms: true,  // Set flag to avoid having the "no programs found" message flash
      hasNextPage: false,
      nextPageNumber: null,
      searchQuery: '',
    });

    this.fetchProgramGroups();

  },

  /**
   * Get active filter by type parameter.
   */
  getTypeFilteringValue: function () {

    // TODO allow for multiple filters
    /*
     * Each filter is an object on the form
     * {
     *   title: 春假,
     *   active: bool
     * }
     */
    let filters = [];

    this.data.filters.filter( f => f.active ).forEach( f => { filters.push(f.title); });

    // Return all the active filter titles separated by ','
    return filters.join();

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

  /** Launch a search */
  search: function (e) {

    const queryString = e.detail.value;

    console.debug(`User launched ProgramGroup search with query "${queryString}"`);

    this.setData({
      programGroups: [],      // With the search we get a complete new set of ProgramGroups
      loadingPrograms: true,  // Set flag to avoid having the "no programs found" message flash
      hasNextPage: false,     // Reset paginator object pointers
      nextPageNumber: null,
      searchQuery: queryString,
    });

    this.fetchProgramGroups(queryString, null);
  },

  /** Fetch the next page of data */
  onReachBottom: function () {
    if (!this.data.loadingPrograms && this.data.hasNextPage) {
      this.fetchProgramGroups(this.data.searchQuery, this.data.nextPageNumber);
    }
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
