// pages/edit-account-details/edit-account-details.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    hasUserInfo: false,
    userInfo: null,
    resUrl: app.globalData.resUrl,
    accountInfo: null,
    errors: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo,
      accountInfo: app.globalData.accountInfoProvider
    });

    wx.setNavigationBarTitle({
      title: '编辑会员信息',
    });

  },

  /** Handle account info form submission */
  formSubmit: function (e) {

    /* {"name":"Raul","phone":"1553243245","wechat":"my-wechat"} */
    const formData = e.detail.value,
      errors = {};

    if (formData.name && formData.phone && formData.wechat) {

      let hasUpdate = false;
      const updatedData = {},
        attrs = ['name','phone','wechat'];

      attrs.forEach( attr => {

        if (formData[attr] !== this.data.accountInfo[attr]) {

          hasUpdate = true;
          updatedData[attr] = formData[attr];

        }

      });

      if (hasUpdate) {

        this.sendData(updatedData);

      } else {

        console.debug('No fields updated, navigate back');

        wx.navigateBack({
          delta: 1
        });

      }
      
    } else {

      wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      });

      Object.keys(formData).forEach( i => {

        if (!formData[i]) {

          // Field is empty
          errors[i] = '这是必填栏';

        }

      });

      this.setData({errors: errors});

    }
  },

  /**
   * Send updated data to the server 
   */
  sendData: function (data) {

    wx.showLoading({
      title: '下载中',
    });

    wx.request({
      url: app.globalData.url + 'families/' + this.data.accountInfo.id,
      method: 'PUT',
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {

        if (res.statusCode === 200) {

          wx.navigateBack({
            delta: 1
          });

        } else if (res.statusCode === 422) {

          this.updateModelErrors(res.data);

        } else {

          wx.showToast({
            title: '服务器错误，请稍后再试',
          });

          console.warn('Unrecognized response code ' + res.statusCode);

        }

      },
      fail: res => {

        wx.showToast({
          title: '服务器错误，请稍后再试',
        });

        console.error(res);
      },
      complete: () => { 
        wx.hideLoading();
      }
    });

  },

  /**
   * Add validation errors to the page and update the interface to show them.
   * 
   * The errors will be received in an array of the form:
    [
        {
            "field": "is_kid",
            "message": "Is Kid must be either \"1\" or \"0\"."
        },
        {
            "field": "name",
            "message": "Name should contain at most 12 characters."
        }
    ]

   * And will be converted to an object that will use field name as property key and message as property 
   * value.
   */
  updateModelErrors: function (errors) {

    const errorObject = {};

    errors.forEach(error => {
      errorObject[error.field] = error.message;
    });

    this.setData({
      errors: errorObject
    });

  }

})
