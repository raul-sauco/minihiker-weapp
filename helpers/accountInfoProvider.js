/**
 * AccountInfoProvider encapsulates logic related with 
 * fetching and storing account information.
 */
const util = require('../utils/util.js');

class AccountInfoProvider {

  maxCache = 1000 * 60 * 60 * 2; // Two hours

  id = null;
  name = '';
  serial_number = '';
  category = '';
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

    console.log('Updating application AccountInfoProvider with JSON data from server');
    console.log(serverJson);

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

}

module.exports = AccountInfoProvider;