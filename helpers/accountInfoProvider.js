/**
 * AccountInfoProvider encapsulates logic related with 
 * fetching and storing account information.
 */
class AccountInfoProvider {

  clients = Map;

  /**
   * Initialize the AccountInfoProvider
   */
  constructor() {
  }

  /**
   * Fill an instance value based on server JSON response
   */
  saveFromServerResponse (serverJson) {

    console.log('Updating application AccountInfoProvider with JSON data from server');
    console.log(serverJson);

    this.id                 =   serverJson.id;
    this.name               =   serverJson.name;
    this.serial_number      =   serverJson.serial_number;
    this.category           =   serverJson.category;
    this.membership_date    =   serverJson.membership_date;
    this.address            =   serverJson.address;
    this.place_of_residence = serverJson.place_of_residence;
    this.remarks            = serverJson.remarks;
    this.mother_id          = serverJson.mother_id;
    this.father_id          = serverJson.father_id;
    this.updated_ts         = Date.now();
    this.clients            = serverJson.clients;

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
   * It will log a warning if the Client is not in the Map.
   */
  getClient(id) {

    // Parse id in case it is a string
    id = parseInt(id, 10);

    return this.clients.find(client => client.id === id);
  }

}

module.exports = AccountInfoProvider;