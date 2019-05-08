// pages/program-registration/program-registration.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    program: null,
    accountInfo: null,
    selectedClients: [],
    ammountDue: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '正在报名',
    });

    // Fetch the programGroup and program from the global programProvider
    let pg = app.globalData.programProvider.get(options.pg);
    let p = pg.programs.find(program => {
      return program.id == options.p;
    });

    this.setData({
      programGroup: pg,
      program: p,
      accountInfo: app.globalData.accountInfoProvider
    });
  },

  /**
   * Update the selected status of a client.
   */
  switchClientSelected: function (e) {

    let clientId = e.currentTarget.dataset.clientId;
    let selected = e.detail.value; // Boolean

    if (selected && !this.data.selectedClients.includes(clientId)) {

      // Add the client id to the array if selected an not previously there
      this.data.selectedClients.push(clientId);

    } else {

      if (this.data.selectedClients.includes(clientId)) {

        let key = this.data.selectedClients.findIndex( e => e == clientId);

        this.data.selectedClients.splice(key, 1);

      }

    }

    this.setData({
      ammountDue: this.data.program.price * this.data.selectedClients.length
    });

  },

  processPayment: function () {
    console.log('Selected clients: ' + this.data.selectedClients.toString());
    console.log('Registering for program ' + this.data.program.id);
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

  }
})