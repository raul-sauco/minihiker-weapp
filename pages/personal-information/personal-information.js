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

    let title = '创建新营员';
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
          this.showToast({
            icon: 'error',
            content: '有些不对劲'
          });
        }
      },
      fail: res => {
        this.showToast({
          icon: 'error',
          content: '有些不对劲'
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

    let requiredAttrs = ['name_zh','id_card_number','family_role_id'],
      missing = false;
    if (this.data.client.hasInt) {
      requiredAttrs.push('passport_number', 'passport_issue_date', 'passport_expire_date', 'passport_place_of_issue');
    }

    requiredAttrs.forEach( a => {

      // Check if a required field is empty
      if (!this.data.client[a]) {

        missing = true;
        errors[a] = '请填写必填项';

      }

    });

    // If any of the required fields are empty, ask the user to fill them
    if (missing) {

      this.setData({
        errors: errors
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
        content: '无法保存数据，请检查错误消息，然后重试。',
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
    }, 1500);
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

            console.debug('Image Upload success');

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

            } else if (res.statusCode == 422) {

              // The request was correct but there were some validation errors
              console.log('PI::uploadImage encountered validation errors 422 code returned');
              console.warn(clientData);

              this.updateModelErrors(clientData);

              this.showToast({
                icon: 'error',
                content: '资料有误'
              });

            } else {

              console.warn('PI::uploadImage; Server returned a ' + res.statusCode + ' code.');

              this.showToast({
                icon: 'error',
                content: '有些不对劲'
              });

              wx.showModal({
                title: '有些不对劲',
                content: JSON.stringify(err),
              });

            }
          },
          fail: err => {
            console.error(err);

            this.showToast({
              icon: 'error',
              content: '网络错误'
            });

            if (err.errMsg && err.errMsg.indexOf('url') !== 1) {

              wx.showModal({
                title: '网络错误',
                content: `${err.errMsg}; url: ${url}`,
              });

            } else {

              wx.showModal({
                title: '网络错误',
                content: JSON.stringify(err),
              });
            }

          },
          complete: () => {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
          }
        })
      },
      fail: err => {
        
        console.error('wx.chooseImage error');

        this.showToast({
          icon: 'error',
          content: '选择图片时出错'
        });

        wx.showModal({
          title: '有些不对劲',
          content: JSON.stringify(err),
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

        if (res.statusCode == 204) {

          this.showToast({
            icon: 'success',
            content: '删除成功'
          });

          // Update the global provider information with client data and persist it
          wx.navigateBack({ delta: 1 });

        }  else {

          console.warn('Client delete encountered an error', res);

          this.showToast({
            icon: 'error',
            content: '有些不对劲'
          });

        }
      },
      fail: err => {

        wx.hideLoading();

        this.showToast({
          icon: 'error',
          content: '有些不对劲'
        });

        console.warn('PI::saveUser request failed', err);
      },
      complete: res => { }
    });
  }
})
