const app = getApp()

Page({
  data: {
    loadingPrograms: true,
    hasNextPage: false,
    nextPageNumber: null,
    resUrl: app.globalData.resUrl,
    programGroups: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    this.fetchProgramGroups(null);
  },

  /**
   * Fetch program groups from the server
   */
  fetchProgramGroups: function (page) {

    this.setData({
      loadingPrograms: true
    });

    wx.showNavigationBarLoading();

    // TODO add filters
    const params = {
      int: 'false',
      'per-page': 3,    // 3 seems to work well, maybe increase reach page end sensitivity
    };

    if (page) {
      params.page = page;
    }

    app.globalData.programProvider.fetchRecommendedProgramGroups(params).then(res => {

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

      setTimeout(this.fetchProgramGroups, 3000, page);

    }).finally(() => {

      wx.hideNavigationBarLoading();

    });

  },

  /** Fetch the next page of data */
  onReachBottom: function () {

    if (!this.data.loadingPrograms && this.data.hasNextPage) {

      this.fetchProgramGroups(this.data.nextPageNumber);

    }

  }
})
