const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    accountInfo: app.globalData.accountInfoProvider,
    resUrl: app.globalData.resUrl,
    hasUserInfo: false,
    userInfo: null,
    contacts: [
      {
        name: '办公室电话',
        image: 'logo-only-sq-64.png',
        hours: '工作日9: 00 - 18: 00',
        phone: '010 - 57271804'
      },
      {
        name: '小精灵Lily',
        image: 'logo-only-sq-64.png',
        hours: '周末及下班时间',
        phone: '17600979374'
      },
      {
        name: '小精灵Amy',
        image: 'logo-only-sq-64.png',
        hours: '周末及下班时间',
        phone: '18514784894'
      }
    ]
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      accountInfo: app.globalData.accountInfoProvider,
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    });

  },

  call: function (event) {

    const phone = event.currentTarget.dataset.phone;

    console.log(`Calling ${phone}`);

    wx.makePhoneCall({
      phoneNumber: phone,
    });

  }

})
