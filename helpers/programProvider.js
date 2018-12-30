/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  url = 'http://minihiker.com/api/';
  authToken = 'Bearer Bt6w40-Z9l7biq8PiNNpYdSKFR5nirbv';

  /**
   * Fetch all program group information from the server
   */
  fetchProgramGroups() {
    console.log('Sending Request for program-groups');

    var endpoint = 'program-groups?weapp_visible=true';

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      },
      success: function(res) {
        console.log(res.data)
      },
      fail: function(res) {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: function(res) {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });
  }
}

module.exports = ProgramProvider;