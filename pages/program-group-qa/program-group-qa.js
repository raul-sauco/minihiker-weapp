// pages/program-group-qa/program-group-qa.js
const app = getApp()

Page({

  /** Page initial data */
  data: {
    programGroup: null,
    qas: [],
    staticUrl: null,
    loading: false,
    hasNextPage: false,
    nextPageNumber: null
  },

  timeout: null,

  /** Lifecycle function--Called when page load */
  onLoad: function (options) {
    this.setData({
      programGroup: app.globalData.programProvider.get(options.id),
      staticUrl: app.globalData.staticUrl
    });
    wx.setNavigationBarTitle({
      title: '问答 ' + this.data.programGroup.weapp_display_name
    });
  },

  /** Reload QAs on page show */
  onShow: function () {
    this.setData({
      qas: []
    });
    this.fetchProgramGroupQa(null);
  },

  /** Clean up */
  onHide: function () {
    clearTimeout(this.timeout);
  },

  /** Clean up */
  onUnload: function () {
    clearTimeout(this.timeout);
  },

  /** Fetch the Current ProgramGroup's Qa */
  fetchProgramGroupQa: function (page) {
    this.setData({ loading: true });
    wx.showNavigationBarLoading();
    let url = app.globalData.url + 'qas?program_group=' + 
      this.data.programGroup.id + '&expand=wxAccountNickname,wxAccountAvatar';
    if (page !== null) {
      url += `&page=${page}`;
    }
    const header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
    };
    wx.request({
      url,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          // Calculate pagination
          const currentPage = res.header['X-Pagination-Current-Page'];
          const totalPages = res.header['X-Pagination-Page-Count'];
          const hasNextPage = currentPage < totalPages;
          const nextPageNumber = hasNextPage ? +res.header['X-Pagination-Current-Page'] + 1 : null;

          const qas = this.data.qas.concat(res.data);
          qas.sort( (a,b) => b.created_at - a.created_at );
          this.setData({
            qas,
            hasNextPage,
            nextPageNumber
          });
          this.calculateTimestamps();
        } else {
          const message = `Unexpected return code ${res.statusCode}`;
          console.warn(message);
          app.globalData.logger.log({
            message,
            res,
            req: {
              url, header, page: 'program-group-qa', line: '60', extra: 'MH error code 68060'
            }
          });
        }
      },
      fail: (res) => {
        const message = `Request ${url} failed`;
        console.warn(message)
        app.globalData.logger.log({
          message,
          res,
          req: {
            url, header, page: 'program-group-qa', line: '72', extra: 'MH error code 68072'
          }
        });;
      },
      complete: (res) => {
        wx.hideNavigationBarLoading();
        this.setData({ loading: false });
      }
    })
  },

  /** Calculate a human readable version of the creation time */
  calculateTimestamps: function () {
    clearTimeout(this.timeout);
    const qas = this.data.qas;
    let timeoutDelay = 30000;
    let mostRecentTimestamp = 0;
    if (qas.length > 0) {
      qas.forEach(qa => {
        qa.asked = this.ago(qa.created_at);
        if (qa.created_at > mostRecentTimestamp) {
          mostRecentTimestamp = qa.created_at;
        }
      });
      // If we have any recent questions, update the UI frequently
      if (mostRecentTimestamp > 0) {
        mostRecentTimestamp *= 1000;
        const diff = 0 | (Date.now() - mostRecentTimestamp) / 1000;
        if (diff < 60) {
          timeoutDelay = 1000;
        }
      }
      this.setData({ qas });
      this.timeout = setTimeout(this.calculateTimestamps, timeoutDelay);
    }
  },

  /**
   * Allow the user to send a QA related to this ProgramGroup
   */
  askQuestion: function () {
    wx.navigateTo({
      url: '../ask-question/ask-question?id=' + this.data.programGroup.id,
    });
  },
  
  /**
   * See 
   * https://github.com/odyniec/tinyAgo-js/blob/master/tinyAgo.js
   */
  ago: function (phpts) {
    let val = phpts * 1000; // Convert PHP timestamp (seconds) to ms
    val = 0 | (Date.now() - val) / 1000;
    /* var unit, length = {
      second: 60, minute: 60, hour: 24, day: 7, week: 4.35,
      month: 12, year: 10000
    }, result;
    */

    var unit, length = {
      秒: 60, 分钟: 60, 小时: 24, 天: 7, 星期: 4.35,
      月: 12, 年: 10000
    }, result;

    for(unit in length) {
      result = val % length[unit];
      if (!(val = 0 | val / length[unit]))
        return result + ' ' + unit + '前';
    }
  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.' + this.data.programGroup.weapp_display_name + '.问答.',
      path: '/pages/program-group-qa/program-group-qa?id=' + this.data.programGroup.id
    };
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    this.setData({
      qas: [],
      hasNextPage: false,
      nextPageNumber: null
    });
    this.fetchProgramGroupQa(null);
  },

  /** Called when page reach bottom */
  onReachBottom: function () {
    if (!this.data.loading && this.data.hasNextPage) {
      this.fetchProgramGroupQa(this.data.nextPageNumber);
    }
  }
})
