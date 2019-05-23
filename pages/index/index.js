//index.js
const app = getApp()

Page({
  data: {
    programProvider: app.globalData.programProvider,
    programGroups: [],
    filters: [
      {
        title: '寒假',
        active: false,
        query: {
          parameter: 'type',
          value: '寒假'
        }
      },
      {
        title: '暑假',
        active: false,
        query: {
          parameter: 'type',
          value: '暑假'
        },
      },
      {
        title: '清明',
        active: false,
        query: {
          parameter: 'type',
          value: '清明'
        }
      },
      {
        title: '春假',
        active: false,
        query: {
          parameter: 'type',
          value: '春假'
        }
      },
      {
        title: '五一',
        active: false,
        query: {
          parameter: 'type',
          value: '五一'
        }
      },
      {
        title: '端午',
        active: false,
        query: {
          parameter: 'type',
          value: '端午'
        }
      },
      {
        title: '国庆',
        active: false,
        query: {
          parameter: 'type',
          value: '国庆'
        }
      },
      {
        title: '圣诞',
        active: false,
        query: {
          parameter: 'type',
          value: '圣诞'
        },
      },
      {
        title: '元旦',
        active: false,
        query: {
          parameter: 'type',
          value: '元旦'
        }
      },
      {
        title: '夏令营',
        active: false,
        query: {
          parameter: 'type',
          value: '夏令营'
        }
      },
      {
        title: '冬令营',
        active: false,
        query: {
          parameter: 'type',
          value: '冬令营'
        }
      }
    ]
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {    
    this.fetchProgramGroups();
  },

  /**
   * Fetch program groups from the server
   */
  fetchProgramGroups: function() {

    // TODO allow for pagination

    wx.showLoading({
      title: '下载中',
    });
    
    // We are fetching international programs
    let endpoint = 'program-groups?weapp_visible=true&int=true&expand=location,programs,type,programs.registrations,programs.period';

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
          programGroups: res.data
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
      title: '童行者.国际项目.',
      path: '/pages/index/index'
    };
  }
})
