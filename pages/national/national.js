//index.js
const app = getApp()

Page({
  data: {
    pageReady: false,
    programGroups: [],
    filters: [
      {
        title: '单日活动',
        active: false,
        query: {
          parameter: 'type',
          value: '单日活动'
        }
      },
      {
        title: '周末',
        active: false,
        query: {
          parameter: 'type',
          value: '周末'
        },
      },
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
  fetchProgramGroups: function () {

    // TODO allow for pagination

    this.setData({
      pageReady: false
    });

    wx.showLoading({
      title: '下载中',
    });

    // We are fetching national programs
    let endpoint = 'program-groups?weapp_visible=true&int=false&expand=location,programs,type,programs.registrations,programs.period,programs.prices';

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
