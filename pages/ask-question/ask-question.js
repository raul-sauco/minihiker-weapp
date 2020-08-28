// pages/ask-question/ask-question.js
const app = getApp()

Page({

  /** Page initial data */
  data: {
    programGroup: null,
    loading: false,
    characterCount: '0/200'
  },

  /** Lifecycle function--Called when page load */
  onLoad: function (options) {
    this.setData({
      programGroup: app.globalData.programProvider.get(options.id)
    });
  },

  /** Bind input event function */
  bindInput: function (e) {
    this.setData({
      characterCount: e.detail.value.length + '/200'
    });
  },

  /**
   * Grab the question text created by the user from the text
   * area and send it to the server to create a new Qa.
   */
  sendQa: function (e) {
    this.setData({
      loading: true
    });
    wx.showNavigationBarLoading();
    const url = app.globalData.url + 'qas?expand=wxAccountNickname,wxAccountAvatar';
    const data = {
      program_group_id: this.data.programGroup.id,
      question: e.detail.value.textarea
    };
    const header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
    };
    wx.request({
      url,
      data,
      method: 'POST',
      header,
      success: res => {
        wx.navigateBack({ delta: 1 });
      },
      fail: res => {
        console.warn('Request failed. ' + url);
      },
      complete: () => {
        this.setData({ loading: false});
        wx.hideNavigationBarLoading();
      }
    });
  }
})
