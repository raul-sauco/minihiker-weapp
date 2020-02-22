// pages/personal-information/personal-information.js
const app = getApp()

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
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    let title = '创建新营员',
      client = {};

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
      client: client
    });

    wx.setNavigationBarTitle({
      title: title,
    });

  },

  /**
   * Handler for the blur event on the Client's name input field
   */
  updatePI: function (e) {

    let attr = e.target.dataset.attr;
    let updatedValue = e.detail.value;
    let oldValue = this.data.client[attr];

    // Prepare variables 
    if (typeof oldValue === 'string' && typeof updatedValue === 'string') {

      oldValue = oldValue.trim();
      updatedValue = updatedValue.trim();

    }
    
    // TODO improve the check on updated attributes
    if (this.isValueUpdated(oldValue, updatedValue)) {

      console.log('The user has updated ' + attr + ' value from ' + this.data.client[attr] + ' to ' + updatedValue);
      this.saveUpdatedClientInfo(attr, updatedValue);

    } else {

      console.log('User information was not updated');

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

    } else if (oldValue === newValue) {

      // The old value and new value are the same do not update
      return false;

    } else {

      // Changed value, update
      return true;
      
    }
  },

  /**
   * Save the updated client information on all relevant places.
   */
  saveUpdatedClientInfo: function (attr, updatedValue) {

    // Semantically should be a PATCH but wx.request does not allow it
    let method = 'PUT';
    let endpoint = 'clients';

    if (!this.data.client.id) {

      console.log('New client entry, POST');
      console.log(this.data.client);
      method = 'POST';

    } else {

      console.log('Existing client with ID ' + this.data.client.id + ' PUT ');

      // Update endpoint to include the client ID ie 'clients/45'
      endpoint += '/' + this.data.client.id;
      
    }

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

        if (res.statusCode == 200 || res.statusCode == 201) {

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

        } else if (res.statusCode == 422) {

          // The request was correct but there were some validation errors
          console.log('PI::saveUser server encountered validation errors 422 code returned');
          console.log(res.data);

          this.updateModelErrors(res.data);

        } else {

          console.warn('PI::saveUser Server returned a ' + res.statusCode + ' code.');

          this.showToast({
            icon: 'error',
            content: '有些不对劲'
          });
        }

        console.log(res);
      },
      fail: res => {

        this.showToast({
          icon: 'error',
          content: '有些不对劲'
        });

        console.log('PI::saveUser request failed');
      },
      complete: res => {}
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
            wx.navigateBack();
          }
        }
      })

    } else {


      wx.showToast({
        title: '成功！ 保存所有更改',
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
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  }
})
