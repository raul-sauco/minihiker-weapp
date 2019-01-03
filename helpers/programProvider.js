/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  ready = false;

  url = 'http://minihiker.com/api/';
  resUrl = 'http://minihiker.com/webapp/';
  authToken = 'Bearer Bt6w40-Z9l7biq8PiNNpYdSKFR5nirbv';
  programGroups = {};
  programTypes = {};
  programPeriods = {};
  programs = {};

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
        
        res.data.forEach((item) => {

          if (item !== undefined && item.id !== undefined) {
            this.programGroups[item.id] = item;
            this.fetchProgramDetails(this.programGroups[item.id]);
          }

        });
        this.ready = true;
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });
  }

  /** 
   * After successfully fetching programGroups fetch missing information
   * for all of them
   */
  fetchProgramDetails (programGroup) {

    // Point to the right cover image
    programGroup.weapp_cover_image = this.resUrl + 'img/pg/' + 
      programGroup.id + '/' + programGroup.weapp_cover_image;
    
    // Fetch the program type
    if (this.programTypes[programGroup.type_id] === undefined) {
      console.log('unknown programGroup type, fetching from server');
      this.fetchProgramType(programGroup.type_id);
    }

    // Initialize registration_open to false
    programGroup.registration_open = false;

    // Fetch program instances
    this.fetchProgramInstances(programGroup.id);  
  }

  /**
   * Fetch all the program instances related to the program group.
   * 
   * This method will use each program's registration_open attribute
   * to determine and set the registration status of the program group.
   */
  fetchProgramInstances(groupId) {

    var endpoint = 'programs?program_group_id=' + groupId;

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      },
      success: (res) => {
        // If the request is successful assign to object
        res.data.forEach((item) => {
          this.programs[item.id] = item;

          /**
           * If any instance of the program group is still registering show
           * registration as open
           */
          if (item.registration_open) {
            this.programGroups[item.program_group_id].registration_open = true;
          }
        });
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });

  }

  /**
   * Fetch a program-type from the server
   */
  fetchProgramType(id) {

    this.programTypes[id] = {}; // Temporary assignment

    console.debug('Sending Request for program-type ' + id);

    var endpoint = 'program-types/' + id;

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // If the request is successful we should get programs back
        this.programTypes[id] = res.data;
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
        this.programTypes[id] = undefined;  // Assign undefined to know that we failed
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });

  }

}

module.exports = ProgramProvider;