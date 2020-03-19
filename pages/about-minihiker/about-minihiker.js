const app = getApp()

Page({

  data: {
    resUrl: app.globalData.resUrl,
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    photos: [...Array(20).keys()]
  }

})
