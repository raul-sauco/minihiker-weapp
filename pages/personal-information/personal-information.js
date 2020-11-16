// pages/personal-information/personal-information.js
const app = getApp();
const utils = require('../../utils/util.js');

Page({

  /**
   * Page initial data
   */
  data: {
    client: {},
    errors: {},
    familyRoles: ['','孩子','父亲','母亲','爷爷','奶奶','姥姥','姥爷','其他'],
    sexRange: ['女性', '男性'],
    notification: {
      notify: false,
      cssClass: '',
      content: '',
      icon: 'info'
    },
    resUrl: null,
    staticUrl: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    let title = '创建新成员';
    let client = {};

    if (options.id) {

      // The page was called with a Client Id as a parameter, is an update
      client = app.globalData.accountInfoProvider.getClient(options.id);
      title = '更新 ';

      if (client.nickname) {
        title += client.nickname;
      } else if (client.name_zh) {
        title += client.name_zh;
      } else {
        title += client.id;
      }
      
    }

    this.setData({
      client: client,
      resUrl: app.globalData.resUrl,
      staticUrl: app.globalData.staticUrl
    });

    wx.setNavigationBarTitle({
      title: title,
    });

  },

  /**
   * Handler for the blur event on an input field
   */
  updatePI: function (e) {
    const attr = e.target.dataset.attr;
    let updatedValue = e.detail.value;
    let oldValue = this.data.client[attr];
    // Prepare variables 
    if (typeof oldValue === 'string' && typeof updatedValue === 'string') {
      oldValue = oldValue.trim();
      updatedValue = updatedValue.trim();
    }
    if (this.isValueUpdated(oldValue, updatedValue)) {
      console.debug(`User updated ${attr} from ${oldValue} to ${updatedValue}`);
      // ID card number client side validation
      if (attr === 'id_card_number') {
        const validation = utils.verifyIdCard(updatedValue);
        if (validation !== true) {
          const errors = this.data.errors;
          errors.id_card_number = validation;
          this.setData({
            errors
          });
          return false;
        }
      }
      return this.saveUpdatedClientInfo(attr, updatedValue);
    } else {
      console.debug('User information was not updated');
      return false;
    }
  },

  /**
   * Determine whether there has been an update of the user information on the UI
   * return true | false
   */
  isValueUpdated: function (oldValue, newValue) {
    if (!oldValue) {
      if (!newValue) {
        // Both values are empty no change
        return false;
      }
      // Old value is empty and new value has a value, update
      return true;
    }
    return oldValue !== newValue;
  },

  /**
   * Save the updated client information on all relevant places.
   */
  saveUpdatedClientInfo: function (attr, updatedValue) {
    // Semantically should be a PATCH but wx.request does not allow it
    let method = 'PUT';
    let endpoint = 'clients';
    if (!this.data.client.id) {
      console.debug('New client entry, POST', this.data.client);
      method = 'POST';
    } else {
      console.debug('Existing client with ID ' + this.data.client.id + ' PUT ');
      // Update endpoint to include the client ID ie 'clients/45'
      endpoint += '/' + this.data.client.id;
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app.globalData.url + endpoint, 
      method: method,
      data: {
        [attr]: updatedValue
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.setData({
            client: res.data,
            errors: {}
          });
          this.showToast({
            icon: 'success',
            content: '保存所有更改'
          });
          // Update the global provider information with client data and persist it
          app.globalData.accountInfoProvider.updateClientInfo(res.data);
        } else if (res.statusCode === 422) {
          // The request was correct but there were some validation errors
          console.debug('PI::saveUser server encountered validation errors 422 code returned');
          console.debug(res.data);
          this.updateModelErrors(res.data);
        } else {
          console.warn('PI::saveUser Server returned a ' + res.statusCode + ' code.');
          wx.showModal({
            title: '服务器错误',
            content: '处理您的请求时出错，请稍后重试。 （错误15157）',
            showCancel: false
          });
          app.log({
            message: 'Error updating client ' + this.data.client.id + ' personal information',
            extra: 'Unexpected response status code ' + res.statusCode + '; MH error code 15157',
            res: JSON.stringify(res),
            req: JSON.stringify({
              url: app.globalData.url + endpoint,
              method: method,
              data: {
                [attr]: updatedValue
              },
              header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + app.globalData.accessToken
              }
            }),
            level: 1,
            page: 'pages/personal-information',
            method: 'saveUpdatedClientInformation',
            line: '160'
          });
        }
      },
      fail: res => {
        wx.showModal({
          title: '网络错误',
          content: '处理您的请求时出错，请稍后重试。 （错误15183）',
          showCancel: false
        });
        app.log({
          message: 'Error updating client ' + this.data.client.id + ' personal information',
          extra: 'wx.request fail. MH error code 15173',
          res: JSON.stringify(res),
          req: JSON.stringify({
            url: app.globalData.url + endpoint,
            method: method,
            data: {
              [attr]: updatedValue
            },
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.accessToken
            }
          }),
          level: 1,
          page: 'pages/personal-information',
          method: 'saveUpdatedClientInformation',
          line: '175'
        });
        console.warn('PI::saveUser request failed');
      },
      complete: res => {
        wx.hideNavigationBarLoading();
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
            "field": "name_zh",
            "message": "Name Zh should contain at most 12 characters."
        }
    ]

   * And will be converted to an object that will use field name as property key and message as property 
   * value.
   */
  updateModelErrors: function (errors) {

    let errorObject = {};

    errors.forEach(error => {
      errorObject[error.field] = error.message;
    });

    this.setData({
      errors: errorObject
    });

    console.log('Updated this.data.errors');
    console.log(this.data.errors);

  },

  /**
   * Give users a more obvious way to conclude the personal data update.
   */
  formSubmit: function() {

    const errors = {};

    let requiredAttrs = ['name_zh', 'id_card_number', 'family_role_id', 'is_male','birthdate'],
      missing = false;
    if (this.data.client.hasInt) {
      requiredAttrs.push('passport_number', 'passport_issue_date', 'passport_expire_date', 'passport_place_of_issue');
    }

    requiredAttrs.forEach( a => {

      // Check if a required field is empty.
      // Check against null and empty string to avoid `gender: false` and
      // `familyRole: 0` triggering false empties.
      if (this.data.client[a] === null || this.data.client[a] === '') {

        missing = true;
        errors[a] = '请填写必填项';

      }

    });

    // If any of the required fields are empty, ask the user to fill them
    if (missing) {

      this.setData({
        errors: errors
      });

      this.showToast({
        icon: 'warn',
        content: '请您先将必填信息补充完整'
      });

    } else {

      // If all the required fields have data, continue. Conclude update will check other validation errors
      this.concludeUpdate();

    }

  },

  /** Check validation errors and navigate back */
  concludeUpdate: function () {

    if (Object.keys(this.data.errors).length > 0) {

      // There are some errors, report and don't exit
      wx.showModal({
        title: '错误！',
        content: '请您将必填信息补充完整。',
        cancelText: '放弃更改',
        success: function (res) {
          if (res.confirm) {
            console.log('Hiding modal')
          } else if (res.cancel) {
            wx.navigateBack({delta: 1});
          }
        }
      })

    } else {

      wx.showToast({
        title: '更新信息成功！',
        icon: 'success'
      });

      setTimeout(wx.navigateBack, 1500);

    }
  },

  /** 
   * Show a custom, lightweight version of the toast that wechat provides
   */
  showToast: function (data) {

    let notification = {
      notify: true
    };

    notification.cssClass = data.cssClass ? data.cssClass : '';

    notification.icon = data.icon ? data.icon : 'info';

    notification.content = data.content ? data.content : '';

    this.setData({
      notification: notification 
    });

    // Remove the notification from the UI
    setTimeout(() => {
      let notification = {
        notify: false,
        cssClass: '',
        icon: 'info',
        content: ''
      };
      this.setData({notification: notification});
    }, 3000);
  },

  /**
   * Allow the user to upload passport images
   */
  uploadImage: function () {

    console.debug('Uploading client passport image');

    wx.chooseImage({
      success: res => {
        const tempFilePaths = res.tempFilePaths
        const url = app.globalData.url + 'wxcpi';

        console.debug('User selected Image to upload');

        wx.showLoading({
          title: '在上传图片',
        });

        wx.showNavigationBarLoading();

        wx.uploadFile({
          url: url,
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          filePath: tempFilePaths[0],
          name: 'image',
          formData: {
            'client': this.data.client.id
          },
          success: res => {

            // request sends mulitpart data, parse response
            const clientData = JSON.parse(res.data);

            if (res.statusCode === 200) {

              console.debug('Image Upload 200; Updating UI');

              this.setData({
                client: clientData,

              });

              this.showToast({
                icon: 'success',
                content: '更新信息成功！'
              });

              // Update the global provider information with client data and persist it
              app.globalData.accountInfoProvider.updateClientInfo(clientData);

            } else if (res.statusCode === 422) {

              console.warn('PI::uploadImage encountered validation errors 422 code returned', clientData);

              this.updateModelErrors(clientData);

              this.showToast({
                icon: 'warn',
                content: '请检查字段中的错误'
              });

            } else {
              console.warn('PI::uploadImage; Server returned a ' + res.statusCode + ' code.');
              wx.showModal({
                title: '服务器错误',
                content: '处理您的请求时出错，请稍后重试。 （错误15423）',
                showCancel: false
              });
              app.log({
                message: 'Error uploading client passport image. Unexpected response code ' + res.statusCode,
                extra: 'MH error code 15399',
                res: JSON.stringify(res),
                req: JSON.stringify({
                  url,
                  header: {
                    'Authorization': 'Bearer ' + app.globalData.accessToken
                  },
                  filePath: tempFilePaths[0],
                  name: 'image',
                  formData: {
                    'client': this.data.client.id
                  }
                }),
                level: 1,
                page: 'pages/personal-information',
                method: 'uploadImage',
                line: '399'
              });
            }
          },
          fail: err => {
            console.error(err);
            if (err.errMsg && err.errMsg.indexOf('url') !== 1) {
              wx.showModal({
                title: '网络错误15421',
                content: `${err.errMsg}; url: ${url}`,
              });
            } else {
              wx.showModal({
                title: '网络错误15428',
                content: JSON.stringify(err),
              });
            }
            app.log({
              message: 'Request failed uploading client passport image',
              extra: 'MH error code 15421',
              res: JSON.stringify(err),
              req: JSON.stringify({
                url,
                header: {
                  'Authorization': 'Bearer ' + app.globalData.accessToken
                },
                filePath: tempFilePaths[0],
                name: 'image',
                formData: {
                  'client': this.data.client.id
                }
              }),
              level: 1,
              page: 'pages/personal-information',
              method: 'uploadImage',
              line: '399'
            });

          },
          complete: () => {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
          }
        })
      },
      fail: err => {        
        console.error('wx.chooseImage error');
        wx.showModal({
          title: '选择图片时出错',
          content: '请稍后重试。（错误15491）',
          showCancel: false
        });
        app.log({
          message: 'Native wx.chooseimage function error',
          extra: 'MH error code 15491',
          res: JSON.stringify(err),
          level: 1,
          page: 'pages/personal-information',
          method: 'uploadImage',
          line: '449'
        });

      }
    });
  }, // End upload image

  deleteClient: function() {

    console.debug(`Deleting client ${this.data.client.id}`);

    wx.showLoading({
      title: '删除中',
    });

    const url = app.globalData.url + 'clients/' + this.data.client.id;

    wx.request({
      url,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {

        wx.hideLoading();

        if (res.statusCode === 204) {

          this.showToast({
            icon: 'success',
            content: '删除成功'
          });

          // Update the global provider information with client data and persist it
          wx.navigateBack({ delta: 1 });

        }  else {
          console.warn('Client delete encountered an error', res);
          wx.showModal({
            title: '删除错误',
            content: '处理您的请求时出错，请稍后重试。 （错误15543）',
            showCancel: false
          });
          app.log({
            message: 'Error deleting client ' + this.data.client.id,
            res: JSON.stringify(res),
            req: JSON.stringify({
              url,
              method: 'DELETE',
              header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + app.globalData.accessToken
            }}),
            extra: 'Unexpected response code: ' + res.statusCode + '. Mh error code 15543',
            level: 1,
            page: 'pages/personal-information',
            method: 'deleteClient',
            line: '560',
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: '删除错误',
          content: '处理您的请求时出错，请稍后重试。 （错误15586）',
          showCancel: false
        });

        console.warn('PI::saveUser request failed', err);

        // Log this error to the server
        app.log({
          message: 'Error deleting client ' + this.data.client.id,
          res: JSON.stringify(err),
          req: JSON.stringify({
            url,
            method: 'DELETE',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.accessToken
            }
          }),
          extra: 'Request failed. Mh error code 15586',
          level: 1,
          line: '599',
          page: 'pages/personal-information',
          method: 'deleteClient'
        });
      },
      // complete: res => { }
    });
  }
})
