// pages/edit-account-details/edit-account-details.js
const app = getApp()

Page({

  /** Page initial data */
  data: {
    accountInfo: null,
    logger: null,
    errors: {},
    // Need to bound to update the main header
    name: null,
    avatar: null
  },

  /** Lifecycle function--Called when page load */
  onLoad: function (options) {
    this.setData({
      accountInfo: app.globalData.accountInfoProvider,
      logger: app.globalData.logger
    });
  },

  /** Handle account info form submission */
  formSubmit: function (e) {
    /* {"name":"Johny","phone":"1553243245","wechat":"my-wechat"} */
    const formData = e.detail.value;
    const errors = {};
    if (formData.name && formData.phone && formData.wechat) {
      let hasUpdate = false;
      const updatedData = {};
      const attrs = ['name','phone','wechat'];
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
        wx.navigateBack({ delta: 1 });
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
    wx.showLoading({ title: '下载中' });
    const url = app.globalData.url + 'families/' + this.data.accountInfo.id;
    const header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
    };
    wx.request({
      url,
      method: 'PUT',
      data: data,
      header,
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
            icon: 'none'
          });
          this.data.logger.log({
            message: `Unexpected status code ${res.statusCode} on response`,
            req: { url, header, data, method: 'PUT' },
            res,
            page: 'edit-account-details',
            line: '88'
          });
          console.warn('Unrecognized response code ' + res.statusCode);
        }
      },
      fail: res => {
        this.data.logger.log({
          message: `wx.request fail`,
          req: { url, header, data, method: 'PUT' },
          res,
          page: 'edit-account-details',
          line: '100'
        });
        wx.showToast({
          title: '服务器错误，请稍后再试',
          icon: 'none'
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
  },

  /** Let the user update the account's avatar */
  updateAvatar: function () {
    console.debug('Updating account avatar');
    wx.chooseImage({
      success: res => {
        const tempFilePaths = res.tempFilePaths
        const url = app.globalData.url + 'wxua';
        console.debug('User selected avatar to upload');
        wx.showLoading({
          title: '在上传图片',
        });
        wx.showNavigationBarLoading();
        wx.uploadFile({
          url,
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          filePath: tempFilePaths[0],
          name: 'image',
          // formData: {},
          success: res => {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200) {
              console.debug('Avatar update success, updating UI');
              this.setData({ avatar: data.avatar });
              wx.showToast({
                icon: 'success',
                title: '更新头像成功！'
              });
            } else if (res.statusCode === 422) {
              console.warn('PI::uploadImage encountered validation errors 422 code returned', data);
              wx.showToast({
                content: '服务器错误，请稍后再试',
                icon: 'none'
              });
            } else {
              const message = `Unexpected response http code ${res.statusCode}`;
              console.warn(message);
              wx.showModal({
                title: '服务器错误',
                content: '处理您的请求时出错，请稍后重试。 （错误81185）',
                showCancel: false
              });
              this.data.logger.log({
                message: 'Error updating account avatar. Unexpected response code ' + res.statusCode,
                extra: 'MH error code 81185',
                res: JSON.stringify(res),
                req: JSON.stringify({
                  url,
                  header: {
                    'Authorization': 'Bearer ' + app.globalData.accessToken
                  },
                  filePath: tempFilePaths[0],
                  name: 'image'
                }),
                level: 1,
                page: 'edit-account-details',
                method: 'updateAvatar',
                line: '206'
              });
            }
          },
          fail: err => {
            console.error(err);
            if (err.errMsg && err.errMsg.indexOf('url') !== 1) {
              wx.showModal({
                title: '网络错误81211',
                content: `${err.errMsg}; url: ${url}`,
              });
            } else {
              wx.showModal({
                title: '网络错误81216',
                content: JSON.stringify(err),
              });
            }
            this.data.logger.log({
              message: 'Request failed updating account avatar',
              extra: 'MH error code 81216',
              res: JSON.stringify(err),
              req: JSON.stringify({
                url,
                header: {
                  'Authorization': 'Bearer ' + app.globalData.accessToken
                },
                filePath: tempFilePaths[0],
                name: 'image'
              }),
              level: 1,
              page: 'edit-account-information',
              method: 'updateAvatar',
              line: '235'
            });

          },
          complete: () => {
            // wx.hideLoading(); loading gets hidden by wx.showToast()
            wx.hideNavigationBarLoading();
          }
        })
      },
      fail: err => {
        console.error('wx.chooseImage error');
        wx.showModal({
          title: '选择图片时出错',
          content: '请稍后重试。（错误21250）',
          showCancel: false
        });
        this.data.logger.log({
          message: 'Native wx.chooseimage function error',
          extra: 'MH error code 21250',
          res: JSON.stringify(err),
          level: 1,
          page: 'edit-account-details',
          method: 'uploadImage',
          line: '259'
        });

      }
    });
  } // End update avatar
})
