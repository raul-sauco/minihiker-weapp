/**
 * AccountInfoProvider encapsulates logic related with 
 * fetching and storing account information.
 */
const util = require('../utils/util.js');

class AccountInfoProvider {

  logger;

  maxCache = 1000 * 60 * 60 * 2; // Two hours
  accessToken;
  url;

  // Account details
  id = null;
  name = '';
  avatar = '';
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
  updated_ts = null;
  clients = [];  

  /**
   * Initialize the AccountInfoProvider
   */
  constructor() {    
    wx.getStorage({
      key: 'accountInfo',
      success: (res) => { this.assignDataFromJSON(res.data); },
      fail: err => { console.warn('Failed to fetch accountInfo from storage'); }
    });
  }

  /** Get a handle to the application logger */
  setLogger(logger) {
    this.logger = logger;
  }

  /** Setter for API URL */
  setApiUrl(url) {
    this.url = url;
  }

  /** Setter for user's API access token */
  setAccessToken(token) {
    if (token) {
      this.accessToken = token;
      this.fetchAccountInfo();
    } else {
      const message = `Tried to set access token to invalid '${token}' value`;
      this.logger.log({
        message,
        res: null,
        req: null,
        extra: this.toString(),
        page: 'accountInfoProvider',
        method: 'setAccessToken',
        line: 66,
        level: 2
      });
    }
  }

  /**
   * Fetch current user's account information from the backend
   * @returns Promise with the data or object with error details
   */
  fetchAccountInfo() {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        const message = 'Tried to fetch account info without access token';
        console.warn(message);
        this.logger.log({
          message: message,
          res: null,
          req: null,
          extra: this.toString(),
          page: 'accountInfoProvider',
          method: 'fetchAccountInfo',
          line: 75,
          level: 2
        });      
        // Reject promise and let the component handle retry
        reject({
          error: true,
          msg: '帐户编号遗失',
          code: 100 // Missing login status
        });
      } else {
        const endpoint = `account-info?expand=clients,clients.hasInt`;
        const url = this.url + endpoint;
        const header = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        };

        wx.request({
          url,
          header,
          method: 'GET',
          success: res => {

            if (res.statusCode === 200) {

              // Save the refreshed data 
              res.data.updated_ts = Date.now();
              this.assignDataFromJSON(res.data);
              this.saveToStorage();

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
              const message = `Unexpected response code ${res.statusCode} fetching account info. Expected 200`;
              console.warn(message);
              this.logger.log({
                message: message,
                res,
                req: {
                  url,
                  headers, 
                  method: 'GET'
                },
                extra: `Response ${res.statusCode} fetching account info for token ${this.accessToken}`,
                page: 'accountInfoProvider',
                method: 'fetchAccountInfo',
                line: 131,
                level: 2
              });  

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
            const message = 'Fetch account info fail';
            console.warn(message);
            this.logger.log({
              message: message,
              res,
              req: {
                url,
                headers,
                method: 'GET'
              },
              extra: `wx.request failed fetching account info for token ${this.accessToken}`,
              page: 'accountInfoProvider',
              method: 'fetchAccountInfo',
              line: 163,
              level: 2
            }); 

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
    this.avatar = data.avatar;
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
    this.clients = data.clients;
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
    return this.clients.find(client => client.id === parseInt(id, 10));
  }

  /**
   * Update the client array with a new client or new 
   * data for an existing client. It will save the 
   * provider data to storage.
   */
  updateClientInfo(clientData) {
    const key = this.clients.findIndex(e => e.id === parseInt(clientData.id, 10));
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
      success: () => { console.debug('Saved account information to storage'); },
      fail: err => { console.warn('Failed to save account info to storage', err); }
    });
  }

  /**
   * Check if we have a verified way to contact the client by phone-number or wechat
   */
  hasVerifiedContactInformation () {
    return this.phone_verified && this.wechat && this.phone;
    // TODO add methods to check if phone number is valid
  }

  // Override default to string
  toString() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      serial_number: this.serial_number,
      category: this.category,
      phone: this.phone,
      phone_verified: this.phone_verified,
      wechat: this.wechat,
      membership_date: this.membership_date,
      mDate: this.mDate,
      address: this.address,
      place_of_residence: this.place_of_residence,
      remarks: this.remarks
    }, null, 2);
  }
}

module.exports = AccountInfoProvider;
