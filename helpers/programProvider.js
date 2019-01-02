/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  ready = false;

  url = 'http://minihiker.com/api/';
  resUrl = 'http://minihiker.com/webapp/';
  authToken = 'Bearer Bt6w40-Z9l7biq8PiNNpYdSKFR5nirbv';
  programs = [];
  programTypes = {};
  programPeriods = {};

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
      success: (res) => {
        // If the request is successful we should get programs back
        this.programs = res.data;
        this.ready = true;
        console.log(this.programs);

        // Fetch missing program information
        this.fetchProgramDetails();
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });
  }

  /*
   * After successfully fetching programGroups fetch missing information
   * for all of them
  */
  fetchProgramDetails () {
    this.programs.forEach((program) => {

      // Point to the right cover image
      program.weapp_cover_image = this.resUrl + 'img/pg/' + 
        program.id + '/' + program.weapp_cover_image;
      
      
    });
  }
}

module.exports = ProgramProvider;