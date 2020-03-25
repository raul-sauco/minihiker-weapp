Page({

  data: {
    hasError: false,
    error: null
  },

  bindload: function (e) {
    console.log('load');
  },

  binderror: function (e) {
    this.setData({
      hasError: true,
      error: e.detail.errMsg
    })
    
    console.log(e);
  }
})
