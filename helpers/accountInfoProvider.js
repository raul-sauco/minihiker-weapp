/**
 * AccountInfoProvider encapsulates logic related with 
 * fetching and storing account information.
 */
const util = require('../utils/util.js');

class AccountInfoProvider {

  maxCache = 1000 * 60 * 60 * 2; // Two hours
  accessToken;
  url;

  // Account details
  id = null;
  name = '';
  serial_number = '';
  category = '';
  phone = '';
  phone_verified = false;
  wechat = '';
  membership_date = null;
  mDate = null;
  address = '';
  place_of_residence = '';
  remarks = '';
  mother_id = null;
  father_id = null;
  updated_ts = null;
  clients = [];  

  /**
   * Initialize the AccountInfoProvider
   */
  constructor() {
    
    wx.getStorage({
      key: 'accountInfo',
      success: (res) => {
        this.assignDataFromJSON(res.data);
      },
    });

  }

  /** Setter for API URL */
  setApiUrl(url) {
    this.url = url;
  }

  /** Setter for user's API access token */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Fetch current user's account information from the backend
   * @returns Promise with the data or object with error details
   */
  fetchAccountInfo() {

    return new Promise((resolve, reject) => {

      if (!this.id) {

        // We have to wait until we have an accountId
        console.warn('Tried to fetch account info without account ID');
        
        // Reject promise and let the component handle retry
        reject({
          error: true,
          msg: '帐户编号遗失',
          code: 100 // Missing login status
        });

      } else {

        // We have an ID, send the request
        const endpoint = `families/${this.id}?expand=clients,clients.hasInt`,
          url = this.url + endpoint,
          header = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
          };

        wx.request({
          url: url,
          header: header,
          method: 'GET',
          success: res => {

            if (res.statusCode === 200) {

              // Save the refreshed data 
              res.data.updated_ts = Date.now();
              this.saveFromServerResponse(res.data);

              console.group('Fetch Account Info Success');
              console.debug('Success fetching account information from server');
              console.debug(res.data);
              console.groupEnd();

              resolve({
                error: false,
                accountInfo: res.data
              });
              
            } else {

              // There was a problem with the request
              console.group('Fetch account info success not 200');
              console.warn(`Request success but code not 200 fetching account info ${this.id}`);
              console.debug(res);
              console.groupEnd();

              reject({
                error: true,
                msg: '服务器错误',
                code: 200   // Request success but not expected status code
              });

            }
          },
          fail: res => {

            // There was a problem with the request
            console.group('Fetch account info fail');
            console.warn(`Request fail fetching account info ${this.id}`);
            console.debug(res);
            console.groupEnd();

            reject({
              error: true,
              msg: '服务器错误',
              code: 0   // Undefined error
            });

          },
          complete: res => {  }
        });

      }

    });
    
  }

  /**
   * Check whether the info on the provider needs to be updated with server info.
   */
  infoIsOutdated() {

    if (!this.id || !this.updated_ts || ((Date.now() - this.updated_ts) > this.maxCache)) {

      return true;

    } else {

      return false;

    }
  }

  /**
   * Fill an instance value based on a JSON object
   */
  assignDataFromJSON(data) {

    this.id = data.id;
    this.name = data.name;
    this.serial_number = data.serial_number;
    this.category = data.category;
    this.phone = data.phone;
    this.phone_verified = data.phone_verified;
    this.wechat = data.wechat;
    this.membership_date = data.membership_date;
    this.mDate = util.formatDate(data.membership_date);
    this.address = data.address;
    this.place_of_residence = data.place_of_residence;
    this.remarks = data.remarks;
    this.mother_id = data.mother_id;
    this.father_id = data.father_id;
    this.updated_ts = data.updated_ts;
    this.clients = data.clients;

  }

  /**
   * Fill an instance value based on server JSON response
   */
  saveFromServerResponse (serverJson) {

    this.assignDataFromJSON(serverJson);

    this.saveToStorage();

  }

  /**
   * Check if the id value needs to be refreshed with the new value.
   */
  setAccountId(id) {

    if (!this.id || parseInt(id) !== parseInt(this.id)) {
      this.id = id;
      this.saveToStorage();
    }

  }

  /**
   * Add a Client to the Provider's Array.
   */
  addClient(client) {

    // TODO check if the client exists
    this.clients.push(client);

  }

  /**
   * Get a Client by id. 
   * It will return null if the client is not found.
   */
  getClient(id) {

    // Parse id in case it is a string
    id = parseInt(id, 10);

    return this.clients.find(client => client.id === id);
  }

  /**
   * Update the client array with a new client or new 
   * data for an existing client. It will save the 
   * provider data to storage.
   */
  updateClientInfo(clientData) {

    let id = parseInt(clientData.id, 10);

    let key = this.clients.findIndex( e => e.id == id);

    if (key < 0) {

      // There are no clients with the given id
      this.addClient(clientData);

    } else {

      this.clients[key] = clientData;

    }

    this.saveToStorage();

  } 

  /**
   * Save the current values of the accountInfoProvider to storage
   */
  saveToStorage () {
    wx.setStorage({
      key: 'accountInfo',
      data: this,
      success: () => {console.log('Saved account information to storage')}
    });
  }

  /**
   * Check if we have a verified way to contact the client by phone-number or wechat
   */
  hasVerifiedContactInformation () {

    return this.phone_verified && this.wechat && this.phone;

    // TODO add methods to check if phone number is valid

  }

}

module.exports = AccountInfoProvider;
